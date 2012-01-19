function ArticlesListAssistant(articles, title) {
    this.articles = articles;
    this.title = title;
}

ArticlesListAssistant.prototype = {
    setup: function() {
        $("categoryTitle").innerHTML = this.title;
        this.fetchAd();

        this.processArticles();

        this.controller.setupWidget("articlesList", 
            { 
                itemTemplate: "articles-list/rowTemplate", 
                swipeToDelete: false,
                fixedHeightItems: false,
                renderLimit: 20, 
                reorderable: false
            }, 
            this.articlesListModel = { 
                items: this.articles
            } 
        );

        this.onResize = this.onResize.bindAsEventListener(this);
        this.controller.listen(this.controller.window, 'resize', this.onResize, false);
        this.onResize();

        this.onArticleTap = this.onArticleTap.bind(this);
        this.controller.listen("articlesList", Mojo.Event.listTap, this.onArticleTap);
    },
    onResize: function(event) {
        $("articlesListSummaryScroller").setStyle({height: (this.controller.window.innerHeight - (28 + 41)) + "px"});
    },
    onArticleTap: function(item) {
        Mojo.Controller.stageController.pushScene(
            {
                name: "article",
                disableSceneScroller: true
            },
            this.articles,
            item.index
        );
    },
    fetchAd: function() {    // TODO: Refactor ad loading into a model
        this.AdRequest = new Ajax.Request("http://sponsors.webosroundup.com/home/app", {
            method: 'get',
            parameters: {},
            evalJSON: 'force',
            onSuccess: this.adLoaded
            // ignoring ad load failure
        });
    },
    adLoaded: function(response) {
        if((response.status >= 200) && (response.status <= 204)) {
            $("summaryAdSpot").innerHTML = '<a href="' + response.responseJSON.TargetURL + '"><img src="' +
                response.responseJSON.ImagePath + '"></a>';
        }
    },
    processArticles: function() {
        var i;

        for(i = 0; i < this.articles.length; i++)
        {
            if(this.articles[i].img) {    // Shortcut out if we've done this already!
                return;
            }
                
            matches = this.articles[i].excerpt.match(/.*src="([^"]*)/);
            if (matches && matches.length > 1) {
                this.articles[i].img = matches[1];
            }
            else {
                this.articles[i].img = "images/articleIconMissing.png";
            }
            if (i % 2 === 1) {
                this.articles[i].row_class = "palm-row-odd";
            } else {
                this.articles[i].row_class = "palm-row-even";
            }
        }
    },
    activate: function(event) {
    },
    deactivate: function(event) {
    },
    cleanup: function() {
        this.controller.stopListening(this.controller.window, 'resize', this.onResize, false);
        this.controller.stopListening("articlesList", Mojo.Event.tap, this.onArticleTap);
    }
};
