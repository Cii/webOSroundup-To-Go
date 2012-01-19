function StageAssistant() {
}

WORUApp = {};

MenuAttr = {
    omitDefaultItems: true
};

MenuModel = {
    visible: true,
    items: [Mojo.Menu.editItem,
            {
                label: $L("Refresh"),
                command: 'do-refresh'
            },
            Mojo.Menu.prefsItem,
            Mojo.Menu.helpItem
    ]
};
    
StageAssistant.prototype.setup = function() {
    WORUApp.Metrix = new Metrix();
    WORUApp.Metrix.postDeviceData();
    Prefs.load();
    this.controller.setWindowOrientation("free");
    this.controller.pushScene("main");
};

StageAssistant.prototype.handleCommand = function (event) {
    var currentScene = this.controller.activeScene();

    switch(event.type) {
        case Mojo.Event.commandEnable:
            switch (event.command) {
                case Mojo.Menu.prefsCmd:
                    if(currentScene.sceneName !== "preferences")
                        event.stopPropagation();
                    break;
                case Mojo.Menu.helpCmd:
                    if(!currentScene.assistant.helpMenuDisabled) {
                        event.stopPropagation();
                    }
                    break;
            }
            break;
        case Mojo.Event.command:
            switch (event.command) {   
                case Mojo.Menu.helpCmd:
                    this.controller.pushAppSupportInfoScene();
                    break;
                
                case Mojo.Menu.prefsCmd:
                    this.controller.pushScene('preferences');
                    break;
                case 'do-refresh':
                    category_list.each(function(cat) {
                        cat.refresh();
                    });
                    break;
            }
        break;
    }
};
