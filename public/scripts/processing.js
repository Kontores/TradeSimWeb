var processing = {

    position: null,

    pending: null,

    trades: [],

    buy: function(bar) {  
        if(this.position == null)  {
            this.position = {direction: "long", entryDate: bar.date, entryPrice: bar.close};
            return;
        }
        if(this.position.direction == "long" || this.pending)
            return;
        
        if(this.position.direction == "short") {
           this.close(bar);
        }

    },

    sell: function(bar) {
        if(this.position == null) {
            this.position = {direction: "short", entryDate: bar.date, entryPrice: bar.close};
            return;
        }

        if(this.position.direction == "short" || this.pending)
            return;

        if(this.position.direction == "long") {
            this.close(bar);
        }
            
    },

    close: function(bar, closePrice = bar.close) {
        this.trades.push({
            direction: this.position.direction,
            entryDate: this.position.entryDate,
            entryPrice: this.position.entryPrice,
            exitDate: bar.date,
            exitPrice: closePrice,
            result: this.position.direction == "long" ? closePrice - this.position.entryPrice : this.position.entryPrice - closePrice
        });
        this.position = null;
    },

    setStop: function(value, quote, errHandler) {
        var errCode = null;
        if(Number.isNaN(value)|| !value) {
            errCode = 1;
        }
        else if(!this.position) {
            errCode = 2;
        }
        else if(this.position.direction == "long" && value >= quote.close) {
            errCode = 3;
        }
        else if(this.position.direction == "short" && value <= quote.close) {
            errCode = 3;
        }
        if(errCode) {
            errHandler(errCode);
            return;
        }
        this.position.stopPrice = value;
    },

    setLimit: function(value, quote, errHandler) {
        var errCode = null;
        if(Number.isNaN(value) || !value) {
            errCode = 1;
        }
        else if(!this.position) {
            errCode = 2;
        }
        else if(this.position.direction == "long" && value <= quote.close) {
            errCode = 3;
        }
        else if(this.position.direction == "short" && value >= quote.close) {
            errCode = 3;
        }
        if(errCode) {
            errHandler(errCode);
            return;
        }
        this.position.limitPrice = value;
    },

    setPending: function(type, value, errHandler) {
        if(Number.isNaN(value) || !value) {
            errHandler();
            return;
        }
        if(this.position)
            return;

        this.pending = {type: type, price: value};
    },

    update: function(quote) {
        this.updatePosition(quote);
        this.updatePending(quote);
    },

    updatePending(quote) {
        if(!this.pending)
            return;
        if(
            (quote.open > this.pending.price && quote.low <= this.pending.price) ||
            (quote.open < this.pending.price && quote.high >= this.pending.price)
            ) {
            this.pending.type == "long" ? this.buy(quote) : this.sell(quote);
            this.position.entryPrice = this.pending.price;
            this.pending = null;
        }         
    },

    updatePosition: function(quote) {
        if(!this.position)         
            return;
        
        if(this.position.direction == "long") {
            if(this.position.stopPrice && quote.low <= this.position.stopPrice)
                this.close(quote, this.position.stopPrice);
            else if(this.position.limitPrice && quote.high >= this.position.limitPrice)
                this.close(quote, this.position.limitPrice);
            return;
        }
        if(this.position.direction == "short") {
            if(this.position.stopPrice && quote.high >= this.position.stopPrice)
            this.close(quote, this.position.stopPrice);
        else if(this.position.limitPrice && quote.low <= this.position.limitPrice)
            this.close(quote, this.position.limitPrice);
            return;
        }
        
    },

    varMargin: function(currentPrice) {
        if(!this.position)
            return null;
        if(this.position.direction == "long")
            return currentPrice - this.position.entryPrice;
        if(this.position.direction == "short")
            return this.position.entryPrice - currentPrice;
    },

    grossProfit: function() {
        if(this.trades.length == 0)
            return 0;
        var total = 0;
        for(var i = 0; i < this.trades.length; i++) {
            if(this.trades[i].result > 0)
                total += this.trades[i].result;
        }

        return total;
    },

    grossLoss: function() {
        if(this.trades.length == 0)
            return 0;
        var total = 0;
        for(var i = 0; i < this.trades.length; i++) {
            if(this.trades[i].result < 0)
                total += this.trades[i].result;
        }
        return total;
    },

    netProfit: function() {
        if(this.trades.length == 0)
            return 0;
        return this.grossProfit() + this.grossLoss();
    },

    winTrades: function() {
        if(this.trades.length == 0)
            return 0;
        return this.trades.filter(c => c.result > 0).length;
    },

    losingTrades: function() {
        if(this.trades.length == 0)
            return 0;
        return this.trades.filter(c => c.result <= 0).length;
    },

    avgWin: function() {
        return this.grossProfit()/this.winTrades();
    },

    avgLoss: function() {
        return this.grossLoss()/this.losingTrades();
    },

    drawDown: function() {
        var max = 0;
        var drawDown = 0;
        for(var i = 0; i < this.equity().length; i++) {
            if(this.equity()[i] > max)
                max = this.equity()[i];
            if(this.equity()[i] - max < drawDown) 
                drawDown = this.equity(i)[i] - max;
        }
        return drawDown;
    },

    recoveryF: function() {
        return this.drawDown == 0 ? 100 : this.netProfit()/Math.abs(this.drawDown());
    },

    profitFactor: function() {
        return this.grossLoss() == 0 ? 100 : Math.abs(this.grossProfit()/this.grossLoss());
    },

    payoffR: function() {
        if(this.trades.length == 0)
            return 0;
        if(this.avgLoss() == 0)
            return 0;
        return this.avgWin()/this.avgLoss();
    },

    equity: function() {
        var equity = [0];
        for(var i = 0; i < this.trades.length; i++)
            equity.push(equity[equity.length - 1] + this.trades[i].result);
        return equity;
    }

};