function FirstUseDialogAssistant(sceneAssistant, firstUse) {
    this.sceneAssistant = sceneAssistant;
    this.firstUse = firstUse;  // First use or first since update?
    
    this.firstUseMessage = "This app brings you the latest news, reviews, tips, tricks " +
        "and podcasts from webOSroundup all in a beautiful, easy to carry package.  Simply tap on an icon to view " +
        "article summaries in that category.  Swipe left or right in the summaries then tap to view individual articles." +
        "<br><br>If you have any suggestions (or hot news items!), please feel free to contact us in the Help page.  We welcome " +
        "all feedback!";
    
    this.updateMessage = "New features in " + Mojo.appInfo.version + ":<br><ul>" +
        "<li>Added App of the Day and preNotes sections</li>" +
        "<li>Added ability to comment on articles from the app</li>" +
        "<li>Added threaded comment view</li>" +
        "<li>Layout improvements</li>" +
        "</ul>"
}

FirstUseDialogAssistant.prototype = {
    setup: function(widget) {
        this.widget = widget;
        this.sceneAssistant.controller.setupWidget("okButton", {},
        {
            buttonLabel: $L("OK"),
            buttonClass: "add-highscore-button",
            disabled: false
        });
        this.onOK = this.onOK.bindAsEventListener(this)
        Mojo.Event.listen($('okButton'), Mojo.Event.tap, this.onOK);
        if(this.firstUse)
            $("dialog-message").innerHTML = this.firstUseMessage;
        else
            $("dialog-message").innerHTML = this.updateMessage;
    },
    onOK: function() {
        this.widget.mojo.close();
        Prefs.setFirstUse(false);
    },
    cleanup: function() {
        Mojo.Event.stopListening($('okButton'), Mojo.Event.tap, this.onOK); 
    }
};