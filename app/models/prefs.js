
var Prefs = {

    // defaults contains the names and default values, will be used if no saved prefs
    //  be careful not to use any values that would interfere with the object
    defaults: { backgroundClear: true,
                fontSize: 2,
                summaryCardView: true,
                tapReadsAll: true,
                firstUse: true,
                username: '',
                email: '',
                url: ''
    },

    initialize: function() {
        Object.extend(this, this.defaults);
    },
    load: function () {
        cookie = new Mojo.Model.Cookie("Preferences");

        var prefs = cookie.get();

        if (prefs) {
            Object.extend(this, prefs);
        }
        this.setBackgroundClear(this.backgroundClear);
        this.setFontSize(this.fontSize);
        this.updated = (this.version != Mojo.appInfo.version);
    },
    save: function () {
        var values = {};
        var keys = Object.keys(this.defaults);
        
        values.version = Mojo.appInfo.version;
        for(var i = 0; i < keys.length; i++)
        {
            values[keys[i]] = this[keys[i]];
        }
        cookie = new Mojo.Model.Cookie("Preferences");
        cookie.put(values);
    },
    setBackgroundClear: function(newValue) {
        var oldValue = this.backgroundClear;
        this.backgroundClear = newValue;
        if(newValue) {
            $$("body")[0].removeClassName("whiteBackground");
        }
        else {
            $$("body")[0].addClassName("whiteBackground");
        }
        if(oldValue != newValue) {
            this.save();
        }
    },
    setFontSize: function(newValue) {
        var oldValue = this.fontSize;
        newValue = parseInt(newValue);
        this.fontSize = newValue;
        switch(newValue) {
            case 1:
                $$("body")[0].removeClassName("largeFont");
                $$("body")[0].addClassName("smallFont");
                break;
            case 2:
                $$("body")[0].removeClassName("largeFont");
                $$("body")[0].removeClassName("smallFont");
                break;
            case 3:
                $$("body")[0].removeClassName("smallFont");
                $$("body")[0].addClassName("largeFont");
                break;
            default:
                this.hoopla = 5;
        }
        if(oldValue != newValue) {
            this.save();
        }
    },
    setSummaryCardView: function(newValue) {
        this.summaryCardView = newValue;
        this.save();
    },
    setTapReadsAll: function(newValue) {
        this.tapReadsAll = newValue;
        this.save();
    },
    setFirstUse: function(newValue) {
        this.firstUse  = newValue;
        this.updated = false;
        this.save();
    },
    setUsername: function(newValue) {
        this.username = newValue;
        this.save();
    },
    setEmail: function(newValue) {
        this.email = newValue;
        this.save();
    },
    setUrl: function(newValue) {
        this.url = newValue;
        this.save();
    }
};

Prefs.initialize();