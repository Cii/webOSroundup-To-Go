function MainAssistant() {}

MainAssistant.prototype = {
    setup: function() {
        this.controller.setupWidget(Mojo.Menu.appMenu, MenuAttr, MenuModel);

        // TODO: Move spinners into category model
        this.controller.setupWidget("spinReviews",
            { spinnerSize: "small"},
            { spinning: true}
        );
        
        this.controller.setupWidget("spinNews",
            { spinnerSize: "small"},
            { spinning: true}
        );
        
        this.controller.setupWidget("spinTips",
            { spinnerSize: "small"},
            { spinning: true}
        );
        
        this.controller.setupWidget("spinPodcasts",
            { spinnerSize: "small"},
            { spinning: true}
        );
        
        this.controller.setupWidget("spinAotD",
            { spinnerSize: "small"},
            { spinning: true}
        );
        
        this.controller.setupWidget("spinpreNotes",
            { spinnerSize: "small"},
            { spinning: true}
        );
        
        this.newsCategory = new Category("News", $("btnNews"));
        this.newsCategory.refresh();
        this.tipsCategory = new Category("Tips", $("btnTips"));
        this.tipsCategory.refresh();
        this.reviewsCategory = new Category("Reviews", $("btnReviews"));
        this.reviewsCategory.refresh();
        this.podcastsCategory = new Category("Podcasts", $("btnPodcasts"));
        this.podcastsCategory.refresh();
        this.AotDCategory = new Category("App of the Day", $("btnAotD"));
        this.AotDCategory.refresh();
        this.preNotesCategory = new Category("preNotes", $("btnpreNotes"));
        this.preNotesCategory.refresh();
        
        this.onFBTap = this.onFBTap.bind(this);
        this.controller.listen("btnFB", Mojo.Event.tap, this.onFBTap);
        
        this.onTwitterTap = this.onTwitterTap.bind(this);
        this.controller.listen("btnTwitter", Mojo.Event.tap, this.onTwitterTap);
        
        this.onRefreshTap = this.onRefreshTap.bind(this);
        this.controller.listen("btnRefresh", Mojo.Event.tap, this.onRefreshTap);
    },
    onFBTap: function(event) {
        this.controller.serviceRequest("palm://com.palm.applicationManager", {
            method: "open",
            parameters:  {
                id: 'com.palm.app.browser',
                params: {
                    target: "http://m.facebook.com/webOSroundup"
                }
            }
        });
    },
    onTwitterTap: function(event) {
        this.controller.serviceRequest("palm://com.palm.applicationManager", {
            method: "open",
            parameters:  {
                id: 'com.palm.app.browser',
                params: {
                    target: "http://twitter.com/webOSroundup"
                }
            }
        });
    },
    onRefreshTap: function(event) {
        $("btnRefresh").addClassName("spin");
        category_list.each(function(cat) {
            cat.refresh();
        });
        setTimeout(function() {
            $("btnRefresh").removeClassName('spin');
            }, 1000
        );

    },
    activate: function(event) {
        if(Prefs.firstUse || Prefs.updated) {
            this.controller.showDialog({
                template: 'main/first-use-dialog',
                assistant: new FirstUseDialogAssistant(this, Prefs.firstUse)
            });
        } else {
            WORUApp.Metrix.checkBulletinBoard(this.controller, 0);  // TODO: Add version #
        }
    },
    deactivate: function(event) {
    },
    cleanup: function(event) {
    }
}
