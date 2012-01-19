function PreferencesAssistant(argFromPusher) {
}

PreferencesAssistant.prototype = {
    setup: function() {

        this.controller.setupWidget("background",
            {
                label: $L("Text Background"),
                labelPlacement: Mojo.Widget.labelPlacementRight,
                multiline: true,
                choices: [
                    {label: $L("Clear"), value: 1},
                    {label: $L("White"), value: 2}
                ]
            },
            this.backgroundModel = {
                value: Prefs.backgroundClear ? 1 : 2,
                disabled: false
            }
        );
        
        this.controller.setupWidget("font",
            {
                label: $L("Font size"),
                labelPlacement: Mojo.Widget.labelPlacementRight,
                multiline: true,
                choices: [
                    {label: $L("Small"), value: 1},
                    {label: $L("Medium"), value: 2},
                    {label: $L("Large"), value: 3}
                ]
            },
            this.fontModel = {
                value: Prefs.fontSize,
                disabled: false
            }
        );
        
        this.controller.setupWidget("summaryStyle",
            {
                label: $L("Summary style"),
                labelPlacement: Mojo.Widget.labelPlacementRight,
                multiline: true,
                choices: [
                    {label: $L("Cards"), value: 1},
                    {label: $L("List"), value: 2}
                ]
            },
            this.summaryStyleModel = {
                value: Prefs.summaryCardView ? 1 : 2,
                disabled: false
            }
        );
        
        this.controller.setupWidget("reading",
            {
                label: $L("Tap shows..."),
                labelPlacement: Mojo.Widget.labelPlacementRight,
                multiline: true,
                choices: [
                    {label: $L("All articles"), value: 1},
                    {label: $L("Unread only"), value: 2}
                ]
            },
            this.tapModel = {
                value: Prefs.tapReadsAll ?  1 : 2,
                disabled: false
            }
        );
        
        this.controller.setupWidget("username",
            {
                multiline: false,
                hintText: $L("Enter your name..."),
                textCase: Mojo.Widget.steModeTitleCase
            },
            this.usernameModel = {
                value: Prefs.username
            });
            
        this.controller.setupWidget("email",
            {
                multiline: false,
                hintText: $L("Enter your email..."),
                textCase: Mojo.Widget.steModeLowerCase
            },
            this.emailModel = {
                value: Prefs.email
            });
            

        this.controller.setupWidget("url",
            {
                multiline: false,
                hintText: $L("Enter your url (optional)..."),
                textCase: Mojo.Widget.steModeLowerCase
            },
            this.urlModel = {
                value: Prefs.url
            });
            
        this.onPropertyChange = this.onPropertyChange.bind(this);
        this.controller.listen("background", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.listen("font", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.listen("summaryStyle", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.listen("reading", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.listen("username", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.listen("email", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.listen("url", Mojo.Event.propertyChange, this.onPropertyChange);
        
        this.controller.setInitialFocusedElement(null);
    },
    onPropertyChange: function(event) {
        switch(event.model) {
            case this.backgroundModel:
                Prefs.setBackgroundClear(event.value == 1);
                break;
            case this.fontModel:
                Prefs.setFontSize(event.value);
                break;
            case this.summaryStyleModel:
                Prefs.setSummaryCardView(event.value == 1);
                break;
            case this.tapModel:
                Prefs.setTapReadsAll(event.value == 1);
                break;
            case this.usernameModel:
                // TODO: Validate!
                Prefs.setUsername(event.value);
                break;
            case this.emailModel:
                // TODO: Validate!
                Prefs.setEmail(event.value);
                break;
            case this.urlModel:
                // TODO: Validate!
                Prefs.setUrl(event.value);
                break;
        }
    },
    cleanup: function() {
        this.controller.stopListening("background", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.stopListening("font", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.stopListening("summaryStyle", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.stopListening("reading", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.stopListening("username", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.stopListening("email", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.stopListening("url", Mojo.Event.propertyChange, this.onPropertyChange);
    }
};