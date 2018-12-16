
var terminal = {
    
    quotes: [],

    showingQuotes: [],

    showSize: 32,

    currentIndex: 31,

    chart: chart,

    equityChart: equityChart,

    autoScroll: null,

    processing: processing,

    filehandler: filehandler,

    checkQuotesLoaded: function() {
        return this.showingQuotes.length != 0; 
    },

    start: function(input, useRandom = false) {

        if(useRandom) {
            this.useRandomFile();
            return;
        }
        
        if(!useRandom && !input.files[0]) {
            this.showMessage(tMessage.noFile, "yellow");
            return;
        }
        if(this.checkQuotesLoaded()) {
            this.showMessage("file is already loaded", "yellow");
            return;
        }
        if(document.getElementById("separator").value == "") {
            this.showMessage("set separator first", "yellow");
            return;
        }
        if(document.getElementById("decSeparator").value == "") {
            this.showMessage("set decimal separator first", "yellow");
            return;
        }
        this.filehandler.initializeParams([
            document.getElementById("separator").value,
            document.getElementById("decSeparator").value,
            document.getElementById("datePos").value,
            document.getElementById("timePos").value,
            document.getElementById("openPos").value,
            document.getElementById("highPos").value,
            document.getElementById("lowPos").value,
            document.getElementById("closePos").value,
            document.getElementById("volumePos").value
         ]);
        this.filehandler.loadFile(input, this.quotes, this.loadCallback.bind(this));
        if(this.filehandler.err) {
            this.showMessage(this.filehandler.err, "red");
            if(this.filehandler.err == "short") {
                this.showMessage(tMessage.tooShort, "red");
                return;
            }
            if(this.filehandler.err.includes("invalidString")) {
                this.showMessage(tMessage.errInString.replace("#", this.filehandler.err.replace("invalidString")), "red");
                return;
            }
        }
    },

    useRandomFile: function() {
        var files = ["BRD", "IESD", "NGD", "SGD", "WHD"];
        this.quotes = this.filehandler.loadFromServer(`/quotes/${files[Math.floor(Math.random()*files.length)]}.csv`);
        this.loadCallback(null);
    },

    loadCallback: function(err) {
        if(err) {
            if(err == "short") 
                this.showMessage(tMessage.tooShort, "red");
            else if(err.includes("invalidString")) 
                this.showMessage(tMessage.errInString.replace("#", err.replace("invalidString", "")), "red");
            return;
        }
        this.showMessage(tMessage.loadOk +": "+this.quotes.length);
        this.fillShowingQuotes(this.quotes, 0, this.showSize);        
        this.chart.draw(this.showingQuotes, this.processing);
        this.chart.canvas.onmousemove = function(e) {terminal.applyHover(e);};
        this.chart.canvas.onmouseout = function() {terminal.showMessage(null);};
        this.disableChildren(document.getElementById("panel-trading").children, false);
        this.disableChildren(document.getElementById("panel-chart").children, false);
    },

    applyHover : function(e) {
        var quotes = terminal.showingQuotes;
        var showInfo = function(i) {
            terminal.showMessage(tMessage.hover
                .replace('#date', quotes[i].date)
                .replace('#open', quotes[i].open)
                .replace('#high', quotes[i].high)
                .replace('#low', quotes[i].low)
                .replace('#close', quotes[i].close)
                .replace('#volume', quotes[i].volume));   
        };
            for(var i = 0; i < quotes.length - 1; i++) {
                if(e.offsetX  >= quotes[i].x && e.offsetX < quotes[i + 1].x)
                    showInfo(i);
                if(e.offsetX >= quotes[quotes.length - 1].x) {
                    showInfo(quotes.length - 1);
                }
            }   
        
    },

    loadFile: function(input) {
        this.filehandler.loadFile(input);
    },
        
    showMessage: function(message, color="lime") {
        document.getElementById('chart-label').style.color = color;
        document.getElementById('chart-label').innerHTML = message;
    },

    switchNext: function() {
        if(!this.checkQuotesLoaded()) {
            this.showMessage(tMessage.noFile, "yellow");
            return;
        }
        if(this.currentIndex == this.quotes.length - 1) {
            this.showMessage("SIMULATION FINISHED", "yellow");
            return;
        }
        this.currentIndex++;

        this.showingQuotes.shift();
        this.showingQuotes.push(this.quotes[this.currentIndex]);
        this.update(this.showingQuotes[this.showingQuotes.length - 1]);
        this.chart.draw(this.showingQuotes, this.processing);
    },

    zoomIn: function() {
        if(this.showSize == 32) {
            this.showMessage(tMessage.maxZoom, "yellow");
            return;
        }
        this.showSize /= 2;
        this.fillShowingQuotes(this.quotes, this.currentIndex - this.showSize, this.currentIndex + 1);
        this.chart.draw(this.showingQuotes, this.processing);
    },

    zoomOut: function() {
        if(this.showSize*2 - 1 > this.currentIndex) {
            this.showMessage(tMessage.minZoom, "yellow");
            return;
        }
        this.showSize *= 2;
        this.fillShowingQuotes(this.quotes, this.currentIndex - this.showSize, this.currentIndex + 1);
        this.chart.draw(this.showingQuotes, this.processing);
    },

    setAutoScroll: function() {
        if(!this.checkQuotesLoaded()) {
            this.showMessage(tMessage.noFile, "yellow");
            return;
        }
        if(!this.autoScroll) {
            this.autoScroll = setInterval(function() {terminal.switchNext()}, 1000);
        }
    
        else {
            clearInterval(this.autoScroll);
            this.autoScroll = null;
        }
    },

    setScrlSpeed(velocity) {
        if(!this.checkQuotesLoaded()) {
            this.showMessage(tMessage.noFile, "yellow");
            return;
        }
        if(!this.autoScroll)
            return;
        clearInterval(this.autoScroll);
        this.autoScroll = setInterval(function() {terminal.switchNext()}, 1000 - velocity);
    },

    fillShowingQuotes: function(quotes, start, end) {    
        this.showingQuotes = quotes.slice(start, end);
    },

    buy: function() {

        if(!this.checkQuotesLoaded()) {
            this.showMessage(tMessage.noFile, "yellow");
            return;
        }

        if(document.getElementById('pending-entry').value) {
            this.setPending("long", document.getElementById('pending-entry').value);
            this.update(this.showingQuotes[this.showingQuotes.length - 1]);
            this.chart.draw(this.showingQuotes, this.processing);
            return;
        }

        this.processing.buy(this.showingQuotes[this.showingQuotes.length - 1]);
        if(this.processing.position)
            this.showMessage(`Position: ${this.processing.position.direction}, price: ${this.processing.position.entryPrice}`);
        else
            this.showMessage(`Position closed at ${this.processing.trades[this.processing.trades.length - 1].exitPrice}`);
        this.update(this.showingQuotes[this.showingQuotes.length - 1]);
        this.chart.draw(this.showingQuotes, this.processing);
    },

    sell: function() {
        if(!this.checkQuotesLoaded()) {
            this.showMessage(tMessage.noFile, "yellow");
            return;
        }

        if(document.getElementById('pending-entry').value) {
            this.setPending("short", document.getElementById('pending-entry').value);
            this.update(this.showingQuotes[this.showingQuotes.length - 1]);
            this.chart.draw(this.showingQuotes, this.processing);
            return;
        }


        this.processing.sell(this.showingQuotes[this.showingQuotes.length - 1]);
        if(this.processing.position)
            this.showMessage(`Position: ${this.processing.position.direction}, price: ${this.processing.position.entryPrice}`);
        else
            this.showMessage(`Position closed at ${this.processing.trades[this.processing.trades.length - 1].exitPrice}`);
        this.update(this.showingQuotes[this.showingQuotes.length - 1]);
        this.chart.draw(this.showingQuotes, this.processing);
    },

    setStop: function(value) {
        this.processing.setStop(value, this.showingQuotes[this.showingQuotes.length - 1], this.errorHandler.bind(this));
        this.chart.draw(this.showingQuotes, this.processing);
    },

    setLimit: function(value) {
        this.processing.setLimit(value, this.showingQuotes[this.showingQuotes.length - 1], this.errorHandler.bind(this));
        this.chart.draw(this.showingQuotes, this.processing);
    },

    setPending: function(type, value) {
        this.processing.setPending(type, value, this.showMessage("incorrect value", "red"));
    },

    clearOrder: function(order) {
        document.getElementById(order).value = null;
        if(order == "pending-entry") 
            this.processing.pending = null;
        
        else if(!this.processing.position)
            return;
        if(order == "stop-loss") 
            this.processing.position.stopPrice = null;
        if(order == "take-profit")
            this.processing.position.limitPrice = null;
        this.processing.update(this.showingQuotes[this.showingQuotes.length - 1]);
        this.chart.draw(this.showingQuotes, this.processing);       
    },

    errorHandler: function(errorCode) {
        if(errorCode == 1) this.showMessage(tMessage.errNumber, "red");
        if(errorCode == 2) this.showMessage(tMessage.errPos, "red");
        if(errorCode == 3) this.showMessage(tMessage.errPrice, "red");
    },

    initialize: function() {
        this.disableChildren(document.getElementById("panel-trading").children);
        this.disableChildren(document.getElementById("panel-chart").children);
    },

    disableChildren: function(el, value = true) {
        for(var i = 0; i < el.length; i++)
            el[i].disabled = value;
    },

    update: function(quote) {
        this.processing.update(quote);
        if(!this.processing.position) {
            document.getElementById("var-margin").innerHTML = null;
            document.getElementById("position").innerHTML = "None";
            document.getElementById("position").style.color = "lightgrey";
            if(document.getElementById("trade-list").rows.length - 1 < this.processing.trades.length) {
               this.writeTrade(this.processing.trades[this.processing.trades.length - 1]);
               this.equityChart.draw(this.processing.equity());
            }
            
        }
        else {
            document.getElementById("var-margin").innerHTML = this.processing.varMargin(quote.close).toFixed(4);
            document.getElementById("var-margin").style.color = this.processing.varMargin(quote.close) >= 0 ? "lime" : "red";
            document.getElementById("position").innerHTML =  this.processing.position.direction;
            document.getElementById("position").style.color = this.processing.position.direction == "long" ? "lime" : "blue";
            this.clearOrder("pending-entry");
        }

        document.getElementById("total-trades").innerHTML = this.processing.trades.length;

        document.getElementById("net-profit").innerHTML = this.processing.netProfit().toFixed(4);
        document.getElementById("net-profit").style.color = this.processing.netProfit() >= 0 ? "lime" : "red";

        document.getElementById("win-trades").innerHTML = this.processing.winTrades();

        document.getElementById("profit-factor").innerHTML = this.processing.profitFactor().toFixed(2);

        document.getElementById("stat-gross-profit").innerHTML = this.processing.grossProfit().toFixed(4);
        document.getElementById("stat-gross-loss").innerHTML = this.processing.grossLoss().toFixed(4);
        document.getElementById("stat-net-profit").innerHTML = this.processing.netProfit().toFixed(4);
        document.getElementById("stat-drawdown").innerHTML = this.processing.drawDown().toFixed(4);
        document.getElementById("stat-total-trades").innerHTML = this.processing.trades.length;
        document.getElementById("stat-winning-trades").innerHTML = `${this.processing.winTrades()} (${((this.processing.winTrades()/this.processing.trades.length)*100).toFixed(2)})%`;
        document.getElementById("stat-avg-win").innerHTML = this.processing.avgWin().toFixed(4);
        document.getElementById("stat-avg-loss").innerHTML = this.processing.avgLoss().toFixed(4);
        document.getElementById("stat-losing-trades").innerHTML = `${this.processing.losingTrades()} (${((this.processing.losingTrades()/this.processing.trades.length)*100).toFixed(2)})%`;
        document.getElementById("stat-profit-factor").innerHTML = this.processing.profitFactor().toFixed(2);
        document.getElementById("stat-rec-factor").innerHTML = this.processing.recoveryF().toFixed(2);
        document.getElementById("stat-payoff").innerHTML = Math.abs(this.processing.payoffR()).toFixed(4);
    },

    writeTrade(trade) {
       var row = document.getElementById("trade-list").insertRow();
       row.insertCell().innerHTML = trade.direction; 
       row.insertCell().innerHTML = trade.entryDate;
       row.insertCell().innerHTML = trade.entryPrice;
       row.insertCell().innerHTML = trade.exitDate;
       row.insertCell().innerHTML = trade.exitPrice;
       row.insertCell().innerHTML = trade.result.toFixed(4);
       row.style.color = trade.result > 0 ? "navy" : "red";
    }
};

terminal.initialize();
