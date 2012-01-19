function ArticlesAssistant(articles, title) {
    this.articles = articles;
    this.title = title;
}

ArticlesAssistant.prototype = {
    setup: function() {
        var i, html = "";
        
        this.fetchAd();

        for(i = 0; i < this.articles.length; i++) {
            html += '<div class="articleSummary" id="articleSummaryPage:' + (i+1) +
                    '"><div class="articleSummaryTitle">' + this.articles[i].title +
                    '</div>' + this.stripTags(this.articles[i].excerpt) +
                    '</div>'
        }
        $("articleSummaryContainer").innerHTML = html;
        $("categoryTitle").innerHTML = this.title;
        
        this.controller.setupWidget("articleSummaryScroller", {
                mode: 'horizontal-snap'
            }, this.articleSummaryScrollerModel = {
                snapElements: { x: $$('.articleSummary') },
                snapIndex: 0
            }
        );
        this.onResize = this.onResize.bindAsEventListener(this);
        this.controller.listen(this.controller.window, 'resize', this.onResize, false);
        this.onResize();

        this.onArticleTap = this.onArticleTap.bind(this);
        this.controller.listen("articleSummaryContainer", Mojo.Event.tap, this.onArticleTap);

        this.onFlick = this.onFlick.bind(this);
    },
    onResize: function(event) {
        $("articleSummaryContainer").parentNode.style.width = this.controller.window.innerWidth + "px";
        $("articleSummaryContainer").setStyle({
              height: (this.controller.window.innerHeight - (43 + 41)) + "px",
              width: (this.articles.length*(this.controller.window.innerWidth - 24)) + "px"
        });
        $$('.articleSummary').each(function(el) {
            el.style.width = (this.controller.window.innerWidth - 46) + "px";
        }.bind(this));
        if(this.articleSummaryScrollerModel.snapIndex > 0) {
            $("articleSummaryScroller").mojo.setSnapIndex(this.articleSummaryScrollerModel.snapIndex-1, false);
            $("articleSummaryScroller").mojo.setSnapIndex(this.articleSummaryScrollerModel.snapIndex+1, false);
        }
    },
    stripTags: function(text) {
        text = text.replace(/<\/a>/g,'');
        text = text.replace(/<a[^>]*>/g,'');
        return(text);
    },
    onArticleTap: function(text) {
        Mojo.Controller.stageController.pushScene(
            {
                name: "article",
                disableSceneScroller: true
            },
            this.articles,
            this.articleSummaryScrollerModel.snapIndex
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
    onFlick: function(event) {
        var x, y;
        
        x = event.velocity.x;
        y = event.velocity.y;
        
        if(Math.abs(y) > Math.abs(x)) {
            if(y > 0) {
                Mojo.Controller.stageController.popScene();
            }
            else if(y < 0) {
                Mojo.Controller.stageController.pushScene(
                    {
                        name: "article",
                        disableSceneScroller: true
                    },
                    this.articles,
                    this.articleSummaryScrollerModel.snapIndex
                );
            }
            event.stopPropagation();
            event.preventDefault();
        }
    },
    activate: function(event) {
        this.controller.listen(this.controller.window, Mojo.Event.flick, this.onFlick);
    },
    deactivate: function(event) {
        this.controller.stopListening(this.controller.window, Mojo.Event.flick, this.onFlick);
    },
    cleanup: function() {
        this.controller.stopListening(this.controller.window, 'resize', this.onResize, false);
        this.controller.stopListening("articleSummaryContainer", Mojo.Event.tap, this.onArticleTap);
    }
};
