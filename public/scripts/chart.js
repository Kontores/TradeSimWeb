var chart = {

    canvas: document.getElementById('chart'),

    chartAreaStart: 80,

    barInterval: 2.5,

    barLeftPad: 5,

    VertPad: 1,

    draw: function(quotes, data) {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        ctx.font = "12px Arial";
        this.canvas.unitWidth = (this.canvas.width - this.chartAreaStart) / quotes.length / this.barInterval;

        this.normalizeY(quotes);

        for(var i = 0; i < 5; i++) {
            this.drawHorDash(this.canvas.height - (this.canvas.height / 5) * i, ctx, "grey");
            this.drawVerticalDash(235 + this.canvas.width/5 * i, ctx, "grey"); 
        } 
                
        this.drawLegend(ctx);

        for(var i = 0; i < 5; i++) 
            
        

        for(var i = 0; i < quotes.length; i++) {
            var y = quotes[i].close >= quotes[i].open ? quotes[i].close - this.canvas.minY : 
            quotes[i].open - this.canvas.minY;
            y*= this.canvas.yPointVal;
            this.drawCandle(quotes[i], this.chartAreaStart + this.barLeftPad+i*this.canvas.unitWidth*this.barInterval, this.canvas.height - y, ctx);
            // coordinates for use in hover effect
            quotes[i].x = this.chartAreaStart + this.barLeftPad+i*this.canvas.unitWidth*this.barInterval;
        }

        for(var i = 1; i < 5; i++) {
            ctx.fillStyle = "white";
            ctx.fillText((this.canvas.maxY - (this.canvas.height - (this.canvas.height / 5) * i)/this.canvas.yPointVal).toFixed(4), 20, this.canvas.height - (this.canvas.height / 5) * i + 5);
        }
       
        if(data.position) {
            this.drawHorDash(this.canvas.height - (data.position.entryPrice - this.canvas.minY)*this.canvas.yPointVal, ctx, "lime");
            if(data.position.stopPrice)
                this.drawHorDash(this.canvas.height - (data.position.stopPrice - this.canvas.minY)*this.canvas.yPointVal, ctx, "red");
            if(data.position.limitPrice)
                this.drawHorDash(this.canvas.height - (data.position.limitPrice - this.canvas.minY)*this.canvas.yPointVal, ctx, "blue");
        } 

        if(data.pending) {
            this.drawHorDash(this.canvas.height - (data.pending.price - this.canvas.minY)*this.canvas.yPointVal, ctx, "white");
        }

        
    },

    normalizeY: function(quotes) {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        for(var i = 0; i < quotes.length; i++) {
            if(quotes[i].high > max)
                max = quotes[i].high;
            if(quotes[i].low < min)
                min = quotes[i].low;
        }

        this.canvas.maxY = max;
        this.canvas.minY = min;
        this.canvas.yPointVal = (this.canvas.height)/(this.canvas.maxY - this.canvas.minY);
    },

    drawCandle: function(quote, x, y, ctx) {
        const upShadow = Math.min(quote.high - quote.close, quote.high - quote.open)*this.canvas.yPointVal;
        const downShadow = Math.min(quote.open - quote.low, quote.close - quote.low)*this.canvas.yPointVal;
        const body = quote.close - quote.open != 0 ? 
        Math.abs(quote.close - quote.open)*this.canvas.yPointVal : 1;
        ctx.fillStyle = quote.close >= quote.open ? "lime" : "red"; 
        ctx.fillRect(x, y, this.canvas.unitWidth, body);
        ctx.fillRect(x + this.canvas.unitWidth/2,y - upShadow, 1, upShadow);
        ctx.fillRect(x + this.canvas.unitWidth/2,y + body, 1, downShadow);
    },

    drawHorDash(y, ctx, color) {
        ctx.strokeStyle = color;
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(82, y); 
        ctx.lineTo(this.canvas.width, y)
        ctx.stroke();
        ctx.closePath();
    },

    drawVerticalDash(x, ctx, color) {
        ctx.strokeStyle = color;
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(x, 10); 
        ctx.lineTo(x, this.canvas.height);
        ctx.stroke();
        ctx.closePath();
    },

    drawBar: function() {
        // drawing bar

    },

    drawLegend: function(ctx) {
        ctx.strokeStyle = "white";
        ctx.setLineDash([0]);
        ctx.beginPath();
        ctx.moveTo(this.chartAreaStart, this.canvas.height);
        ctx.lineTo(this.chartAreaStart, 0);
        ctx.stroke();
        ctx.closePath();
    },

    drawHorLine: function(ctx, y) {
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(this.chartAreaStart, y);
        ctx.lineTo(this.canvas.width, y);
        ctx.stroke();
        ctx.closePath();
    }
};

var equityChart = {

    canvas: document.getElementById('equity-chart'),

    draw: function(points) {
        if(points.length == 0)
            return;
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.normalizeY(points);
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height/2)
        for(var i = 1; i < points.length; i++) {
            ctx.lineTo(i*this.canvas.width/(points.length - 1), this.canvas.height/2 - points[i]*this.canvas.yPointVal);
            ctx.moveTo(i*this.canvas.width/(points.length - 1), this.canvas.height/2 - points[i]*this.canvas.yPointVal);
        }
        ctx.stroke();
        ctx.closePath();
    },

    normalizeY: function(points) {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        for(var i = 0; i < points.length; i++) {
            if(points[i] > max)
                max = points[i];
            if(points[i] < min)
                min = points[i];
        }

        this.canvas.maxY = max;
        this.canvas.minY = min;
        this.canvas.yPointVal = (this.canvas.height*0.95)/(this.canvas.maxY - this.canvas.minY)/2;
    },
}