var category_list = [];

function Category(name, element) {
    this.name = this.shortname = name;
    this.loaded = false;
    this.ready = false;
    this.element = element;
    element.category = this;
    
    if(name === "News")
        this.category = 1;
    else if(name === "Tips")
        this.category = 131;
    else if(name === "Reviews")
        this.category = 31;
    else if(name === "Podcasts")
        this.category = 458;
    else if(name === "App of the Day")
    {
        this.shortname = "AotD";
        this.category = 859;
    }
    else if(name === "preNotes")
        this.category = 898;
    else
        throw("Invalid category name: " + name);

    this.articlesLoaded = this.articlesLoaded.bind(this);
    this.articlesLoadFailure = this.articlesLoadFailure.bind(this);
    this.onTap = this.onTap.bind(this);
    element.observe(Mojo.Event.tap, this.onTap);
    
    $("notifier" + this.shortname).hide();
    category_list.push(this);
}

Category.prototype = {
    lastReadTime: function() {
        if(!this.loaded)
            this.load();
        return(this.lastRead);
    },
    read: function () {
        this.lastRead = this.newestDate;
        this.save();
        this.updateUnreadCount();
    },
    refresh: function() {
        var url, spinner;

        // Fetch feeds
        this.ready = false;
        spinner = $("spin" + this.shortname);
        if(spinner.mojo) {
            spinner.show();
            spinner.mojo.start();
        }
        $("notifier" + this.shortname).hide();
        url = "http://www.webosroundup.com/ajax.php";
        this.request = new Ajax.Request(url,{
            method: 'get',
            parameters: {category: this.category, posts: 20, brief: 1},
            evalJSON: 'force',
            onSuccess: this.articlesLoaded,
            onFailure: this.articlesLoadFailure
        });
    },
    load: function () {
        var cookie = new Mojo.Model.Cookie(this.shortname);
        var state = cookie.get();

        if(state) {
            this.lastRead = state.lastRead;
        }
        else {
            this.lastRead = 0;
        }
    },
    save: function() {
        var values = {};
        var cookie = new Mojo.Model.Cookie(this.shortname);
        values.lastRead = this.lastRead;
        cookie.put(values);
    },
    onTap: function(event) {
        if(this.ready) {
            Mojo.Controller.stageController.pushScene(
                {
                    name: Prefs.summaryCardView ? "articles" : "articles-list",
                    disableSceneScroller: true
                },
                (Prefs.tapReadsAll || (this.newArticles.length == 0))  ? this.articles : this.newArticles,
                this.name
            );
            this.read();
        }
    },
    articlesLoaded: function(response) {
        if((response.status >= 200) && (response.status <= 204)) {
            this.articles = response.responseJSON;
            this.ready = true;
            $("spin" + this.shortname).mojo.stop();
            $("spin" + this.shortname).hide();
            this.updateUnreadCount();
        }
        else {
            this.articlesLoadFailure(response);
        }
    },
    articlesLoadFailure: function(response) {
        // whoops, a failure!
    },
    updateUnreadCount: function() {
        var i, max, modified, newest = 0, cnt = 0;
        if(this.articles && this.articles.length) {
            this.newArticles = [];
            max = this.articles.length;
            for(i = 0; i < max; i++)
            {
                modified = new Date(this.articles[i].modified).getTime();
                if(modified > this.lastReadTime()) {
                    this.newArticles.push(this.articles[i]);
                    cnt++;
                }
                if(modified > newest) {
                    newest = modified;
                }
            }
            this.newestDate = newest;
        }
        if(cnt > 0) {
            $("notifier" + this.shortname).show();
            $("notifierUnread" + this.shortname).innerHTML = cnt;
        }
        else {
            $("notifier" + this.shortname).hide();
        }
    }
};