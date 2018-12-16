var filehandler = {

    separator: ',',

    decSeparator: '.',

    datePosition: 0,

    timePosition: 1,

    openPosition: 2,

    highPosition: 3,

    lowPosition: 4,

    closePosition: 5,

    volPosition: 6,

    loadFile: function(input, quotesArray, callback) {
        const reader = new FileReader();
        reader.onload = function() { 
            if(reader.result.split('\n').length < 100) {
                callback("short");
                return;
            }   
            terminal.showingQuotes = [];    
            for(var i = 0; i < reader.result.split('\n').length; i++) {
                if(!filehandler.parseQuotes(reader.result.split('\n')[i])) {
                    callback(`invalidString${i + 1}`);           
                    return;
                }
               quotesArray.push(filehandler.parseQuotes(reader.result.split('\n')[i]))
            }
           callback();
        };
        reader.readAsText(input.files[0]);
    },

    loadFromServer: function(path) {
        this.setDefault();
        var result = null
        var request = new XMLHttpRequest();
        var output = [];
        request.open("GET", path, false);
        request.send();
        if(request.status == 200)
            result = request.responseText;
        result = result.split('\n');
        for(var i = 0; i < result.length; i++) 
            output.push(this.parseQuotes(result[i]));
        
        return output;
    },

    parseQuotes: function(str) { 
        if(!str.split(this.separator)) 
            return false;
        if(str.split(this.separator).length < 5)
            return false;
        const quote = {
            date: str.split(this.separator)[this.datePosition],
            time: this.timePosition == -1 ? 0 : str.split(this.separator)[this.timePosition],
            open: parseFloat(str.split(this.separator)[this.openPosition].replace(this.decSeparator, '.')),
            high: parseFloat(str.split(this.separator)[this.highPosition].replace(this.decSeparator, '.')),
            low: parseFloat(str.split(this.separator)[this.lowPosition].replace(this.decSeparator, '.')),
            close: parseFloat(str.split(this.separator)[this.closePosition].replace(this.decSeparator, '.')),
            volume: this.volPosition == -1 ? 0 : parseFloat(str.split(this.separator)[this.volPosition].replace(this.decSeparator, '.'))
        };
        if(isNaN(quote.open) || isNaN(quote.high) || isNaN(quote.low) || isNaN(quote.close) || isNaN(quote.volume))
            return false;

        return quote;
    },

    initializeParams: function(params) {
        this.separator = params[0];
        this.decSeparator = params[1];
        this.datePosition = params[2];
        this.timePosition = params[3];
        this.openPosition = params[4];
        this.highPosition = params[5];
        this.lowPosition = params[6];
        this.closePosition = params[7];
        this.volPosition = params[8];
    },

    setDefault: function() {
        this.separator = ',';
        this.decSeparator = '.';
        this.datePosition = '0';
        this.timePosition = '1';
        this.openPosition = '2';
        this.highPosition = '3';
        this.lowPosition = '4';
        this.closePosition = '5';
        this.volPosition = '6';
    }

}