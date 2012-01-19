function ArticleAssistant(articles, id) {
    this.articles = articles;
    this.id = id;
}

ArticleAssistant.prototype = {
    setup: function() {
        this.articleLoaded = this.articleLoaded.bind(this);
        this.articleLoadFailure = this.articleLoadFailure.bind(this);
        this.commentsLoaded = this.commentsLoaded.bind(this);
        this.commentsLoadFailure = this.commentsLoadFailure.bind(this);
        this.threadIDLoaded = this.threadIDLoaded.bind(this);
        this.threadIDLoadedFailure = this.threadIDLoadedFailure.bind(this);
        this.adLoaded = this.adLoaded.bind(this);
        
        this.fetchAd();
        this.fetchComments();
        
        if(this.articles[this.id].content === undefined) {
            this.controller.setupWidget("articleSpin",
                { spinnerSize: "small"},
                { spinning: true}
            );
            $("articleText").innerHTML = this.articles[this.id].excerpt + '<br><br>' +
                $L("Loading rest of article...");
            this.fetchArticle();
        }
        else {
            $("articleText").innerHTML = this.articles[this.id].content;
        }
        $("articleTitle").innerHTML = this.articles[this.id].title;
        this.onHeaderTap();
        
        this.controller.setupWidget("articleScroller", {}, {
                mode: 'vertical'
            }
        );
        
        this.controller.setupWidget("comment-msg",
            {
                hintText: $L("Enter comment"),
                multiline: true,
                limitResize: true
            },
            this.commentMsgModel = {
                value: "",
                disabled: false
            });
            
        this.controller.setupWidget("reply-button",
            {},
            {
                buttonLabel: $L("Add a comment")
            });
        
        this.controller.setupWidget("submit-button",
            {},
            {
                buttonLabel: $L("Submit")
            });
        
        this.showAddComment = this.showAddComment.bindAsEventListener(this);
        this.controller.listen('reply-button', Mojo.Event.tap, this.showAddComment);
        
        this.commentSubmit = this.commentSubmit.bindAsEventListener(this);
        this.controller.listen('submit-button', Mojo.Event.tap, this.commentSubmit);
        
        this.onResize = this.onResize.bindAsEventListener(this);
        this.controller.listen(this.controller.window, 'resize', this.onResize, false);
        this.onResize();

        this.onHeaderTap = this.onHeaderTap.bind(this);
        this.controller.listen("articleTitle", Mojo.Event.tap, this.onHeaderTap);

        this.onBrowserTap = this.onBrowserTap.bind(this);
        this.controller.listen("browserIcon", Mojo.Event.tap, this.onBrowserTap);

        this.onShareTap = this.onShareTap.bind(this);
        this.controller.listen("shareIcon", Mojo.Event.tap, this.onShareTap);
        
        this.onArticleTap = this.onArticleTap.bind(this);
        this.controller.listen("articleText", "click", this.onArticleTap);
        
        this.commentTap = this.commentTap.bind(this);
        this.controller.listen('comments', Mojo.Event.tap, this.commentTap);

        this.onFlick = this.onFlick.bind(this);
        this.handleImagePop = this.handleImagePop.bind(this);
        this.handleSharePop = this.handleSharePop.bind(this);
        this.facebookFailure1 = this.facebookFailure1.bind(this);
        this.facebookFailure2 = this.facebookFailure2.bind(this);
        this.datajogFailure = this.datajogFailure.bind(this);
        this.relegoFailure = this.relegoFailure.bind(this);
        this.commentPosted = this.commentPosted.bind(this);
        this.commentPostFailure = this.commentPostFailure.bind(this);
        
        this.controller.setInitialFocusedElement(null);

        $("reply-button").hide();
        $("comment-reply").hide();
    },
    fetchArticle: function() {
        this.articleRequest = new Ajax.Request("http://www.webosroundup.com/ajax.php", {
            method: 'get',
            parameters: {post_id: this.articles[this.id].id},
            evalJSON: 'force',
            onSuccess: this.articleLoaded,
            onFailure: this.articleLoadFailure
            // TODO: write handlers
        });
    },
    fetchComments: function() {
        $("comments").hide();
        this.threadIDRequest = new Ajax.Request("http://disqus.com/api/get_thread_by_url", {
            method: 'get',
            parameters: {
                url: this.articles[this.id].permalink,
                forum_api_key: "hxGZJwHvRswfHrfeqzutQTyo7mxZ1oXeTj0m1L6hhq0v6o9IaTqtzTYrmu9SfOT1"
            },
            evalJSON: 'force',
            onSuccess: this.threadIDLoaded,
            onFailure: this.threadIDLoadedFailure
        }); 
    },
    fetchAd: function() {
        this.AdRequest = new Ajax.Request("http://sponsors.webosroundup.com/home/app", {
            method: 'get',
            parameters: {},
            evalJSON: 'force',
            onSuccess: this.adLoaded
            // ignoring ad load failure
        });
    },
    articleLoaded: function(response) {
        var posted, anchor;
        
        if(!this.goingAway && (response.status >= 200) && (response.status <= 204)) {
            if(this.articles[this.id].posted != this.articles[this.id].modified) {
                posted = this.articles[this.id].posted + '<br>Last updated: ' + this.articles[this.id].modified;
            }
            else {
                posted = this.articles[this.id].posted;
            }
            $("articleText").innerHTML = response.responseJSON.content + '<br><div class="postInfo">' +
                $L('Posted by') + ': ' + this.articles[this.id].author + ' ' + $L("on") + ' ' + posted + '</div>';
            $("articleText").select("img").each(function(el) {
                if((el.parentNode.tagName == "A") && (el.src == el.parentNode.href)) {
                    el.parentNode.replace(el);    // In theory, replace anchor tag with element
                }
            });
            $("articleText").select("embed").each(function(el) {    // Swap out embeds with links
                anchor = document.createElement("a");
                anchor.href = el.src;
                anchor.innerHTML = $L("Click to view video...");
                el.replace(anchor);
            });
            this.articles[this.id].content = $("articleText").innerHTML;    // TODO: Is this a good idea?
            $("articleSpin").mojo.stop();
            $("articleSpin").hide();
        }
        else {
            this.articleLoadFailure(response);
        }
    },
    articleLoadFailure: function(response) {
        // TODO: Pop up failure icon with retry button
    },
    commentsLoaded: function(response) {
        var i, msgID, threaded = [],
            output = '<div class="commentsWrapper"><div class="commentHeader">' + $L("Comments") + ':</div>';
        
        if(!this.goingAway && (response.status >= 200) && (response.status <= 204)) {
            for(i = (response.responseJSON.message.length - 1); i >= 0 ; i--) {
                response.responseJSON.message[i].responses = [];
                response.responseJSON.message[i].visited = false;
                threaded[response.responseJSON.message[i].id] = response.responseJSON.message[i];
                if((response.responseJSON.message[i].parent_post !== null) &&
                    (threaded[response.responseJSON.message[i].parent_post] !== undefined)) {
                    threaded[response.responseJSON.message[i].parent_post].responses.push(response.responseJSON.message[i]);
                }
            }

            for(msgID in threaded) {
                output += this.buildCommentOutput(threaded[msgID]);
            }
            output += "</div>";
            $("comments").show();
            $("comments").innerHTML = output;
//            $("articleSpin").mojo.stop();
//            $("articleSpin").hide();
        }
        else {
            this.commentsFailure(response);
        }
    },
    buildCommentOutput: function(msg) {
        var output = "", i, commentClass;
        
        if(msg.shown && !msg.visited)  {
            msg.visited = true;
            commentClass = msg.parent_post ? " nested-comment" : "";
            output += '<div class="commentWrapper' + commentClass + '">' +
                '<div class="comment"><hr />' + msg.message +
                '</div><div class="commentAuthorDate"><div class="commentAuthor">' + $L("by") + ': ' +
                (msg.is_anonymous ? msg.anonymous_author.name : 
                    (msg.author.display_name === "") ? msg.author.username :
                    msg.author.display_name) +
                '</div><div class="commentDate">' + $L("on") + ': ' +
                msg.created_at + '</div></div>';
            if(!msg.is_anonymous && msg.author.has_avatar)
            {
                output += '<img class="commentAvatar" src="' +
                    msg.author.avatar.small + '" />';
            }
            else {
                output += '<img class="commentAvatar" src="http://mediacdn.disqus.com/1287621456/images/noavatar32.png" />';
            }
            output += '<img class="commentReplyImg" id="comment-' + msg.id + '" src="images/reply.png" />';
            output += '<br clear="both" />';
            for(i = 0; i < msg.responses.length; i++) {
                output += this.buildCommentOutput(msg.responses[i]);
            }
            output += '</div>';
        }
        return output;
    },
    commentsLoadFailure: function(response) {
        $("comments").innerHTML = '<div class="commentFailure">Comments failed to load!</div>';
    },
    commentTap: function(event) {
        var id;
        if(event.srcElement.nodeName === "IMG") {
            id = event.srcElement.id.split('-');
            if(id[0] === "comment") {
                this.parent_post_id = id[1];
                this.showAddComment();
            }
        }
    },
    threadIDLoaded: function(response) {
        if(!this.goingAway && (response.status >= 200) &&
            (response.status <= 204) && response.responseJSON.succeeded) {
            $("reply-button").show();
            this.threadID = response.responseJSON.message.id;
            this.commentRequest = new Ajax.Request("http://disqus.com/api/get_thread_posts", {
                method: 'get',
                parameters: {
                    forum_api_key: "hxGZJwHvRswfHrfeqzutQTyo7mxZ1oXeTj0m1L6hhq0v6o9IaTqtzTYrmu9SfOT1",
                    thread_id: this.threadID,
                    limit: 100,
                    exclude: "spam,killed,new"
                },
                evalJSON: 'force',
                onSuccess: this.commentsLoaded,
                onFailure: this.commentsLoadFailure
            });

        }
    },
    threadIDLoadedFailure: function(response) {
        $("commentReplyFailure").show();
    },
    adLoaded: function(response) {
        if(!this.goingAway && (response.status >= 200) && (response.status <= 204)) {
            $("adSpot").innerHTML = '<a href="' + response.responseJSON.TargetURL + '"><img src="' +
                response.responseJSON.ImagePath + '"></a>';
        }
    },
    onResize: function(event) {
        $("articleScroller").style.height = (this.controller.window.innerHeight -
            ($("articleHeaderWrap").getHeight() + 41)) + "px";
        //$("articleWrap").style.height = this.controller.window.innerHeight + "px";
    },
    onArticleTap: function(event) {
        var isLink, items;
        if(event.target.tagName === "IMG") {
            event.preventDefault();
            event.stopPropagation();
            
            items = [
                { label: $L("View image"), command: "view" },
                { label: $L("Save image"), command: "save" }
            ];

            this.imageURL = event.target.src;
            isLink = (event.target.parentNode.tagName === "A");
            if(isLink) {
                this.imageLink = event.target.parentNode.href;
                items.push({ label: $L("Open link"), command: "link" });
            }

            this.controller.popupSubmenu({
                onChoose: this.handleImagePop,
                placeNear: event.target,
                items: items
            });
        }
    },
    handleImagePop: function(value) {
        if(value === "view") {
            Mojo.Controller.stageController.pushScene("picture-viewer", this.imageURL);
        }
        if(value === "link") {
            this.controller.serviceRequest("palm://com.palm.applicationManager", {
                method: "open",
                parameters:  {
                    id: 'com.palm.app.browser',
                    params: {
                        target: this.imageLink
                    }
                }
            });
        }
        else if(value === "save") {
            this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
                method: 'download', 
                parameters: 
                {
                    target: this.imageURL,
                    targetDir : "/media/internal/downloads/",
                    subscribe: true
                },
                onSuccess : function (resp){Mojo.Log.info(Object.toJSON(resp));},
                onFailure : function (e){Mojo.Log.info(Object.toJSON(e));}
            });
        }
    },
    onHeaderTap: function(event) {
        $("articleTitle").toggleClassName("clipped");
    },
    onBrowserTap: function(event) {
        // Should just make the icon a link!

        this.controller.serviceRequest("palm://com.palm.applicationManager", {
            method: "open",
            parameters:  {
                id: 'com.palm.app.browser',
                params: {
                    target: this.articles[this.id].permalink
                }
            }
        });
    },
    onShareTap: function(event) {
        this.controller.popupSubmenu({
            onChoose: this.handleSharePop,
            placeNear: $("shareIcon"),
            items: [
                { label: $L("Email"), command: "email" },
                { label: $L("SMS"), command: "sms" },
                { label: $L("Facebook"), command: "facebook" },
                { label: $L("Clipboard"), command: "clip" },
                { label: $L("DataJog"), command: "datajog"},
                { label: $L("Relego"), command: "relego" }
            ]
        });
    },
    handleSharePop: function(value) {
        var summary = this.articles[this.id].excerpt;
        
        if(summary == '') {
            if(this.articles[this.id].content.length > 500) {
                summary = this.articles[this.id].content.substr(0,500) + '...';
            }
            else {
                summary = this.articles[this.id].content;
            }
        }
        if(value === "email") {
            this.controller.serviceRequest("palm://com.palm.applicationManager", {
                method: "open",
                parameters:  {
                    id: 'com.palm.app.email',
                    params: {
                        summary: "webOSroundup: " + this.articles[this.id].title,
                        text: summary + '<br><br><a href="' +
                            this.articles[this.id].permalink + '">Full Article at webOSroundup</a><br><br>'
                    }
                }
            });
        }
        else if(value === "sms") {
            this.controller.serviceRequest("palm://com.palm.applicationManager", {
                method: "launch",
                parameters:  {
                    id: 'com.palm.app.messaging',
                    params: {
                        messageText: this.articles[this.id].title + ' @ ' + this.articles[this.id].permalink
                    }
                }
            });
        }
        else if(value === "facebook") {
            this.controller.serviceRequest("palm://com.palm.applicationManager", {
                method: "launch",
                parameters:  {
                    id: 'com.palm.app.facebook',
                    params: {
                        status: 'Check out this webOSroundup article: ' +  this.articles[this.id].title +
                        ' -- ' + this.articles[this.id].permalink
                    }
                },
                onFailure: this.facebookFailure1
            });
        }
        else if(value === "datajog") {
            this.controller.serviceRequest("palm://com.palm.applicationManager", {
                method: "launch",
                parameters:  {
                    id: 'com.datajog.webos',
                    params: {
                        action: "send",
                        data: this.articles[this.id].permalink
                    }
                },
                onFailure: this.datajogFailure
            });
        }
        else if(value === "clip") {
            this.controller.stageController.setClipboard(this.articles[this.id].title + ' @ ' + this.articles[this.id].permalink, true);
            Mojo.Controller.getAppController().showBanner($L("Saved to clipboard..."),
                {source: 'notification'});
        }
        else if(value === "relego") {
            this.controller.serviceRequest("palm://com.palm.applicationManager", {
                method: "launch",
                parameters:  {
                    id: 'com.webosroundup.relego',
                    params: {
                        action: 'addtorelego',
                        url: this.articles[this.id].permalink,
                        title: this.articles[this.id].title
                    }
                },
                onFailure: this.relegoFailure
            });
        }
    },
    facebookFailure1: function(event) {
        this.controller.serviceRequest("palm://com.palm.applicationManager", {
            method: "launch",
            parameters:  {
                id: 'com.palm.app.facebook.beta',
                params: {
                    status: 'Check out this webOSroundup article: ' +  this.articles[this.id].title +
                    ' -- ' + this.articles[this.id].permalink
                }
            },
            onFailure: this.facebookFailure2
        });
    },
    facebookFailure2: function(event) {
        Mojo.Controller.getAppController().showBanner($L("Facebook app not installed!"),
            {source: 'notification'});
    },
    datajogFailure: function(event) {
        this.controller.showAlertDialog({
            onChoose: function(value){
                if (value=="yes"){
                    //--> And weee'rrre.. off to see the wizard
                    this.controller.serviceRequest('palm://com.palm.applicationManager', {
                        method:'open',
                        parameters:{
                            target: "http://developer.palm.com/appredirect/?packageid=com.datajog.webos"
                        }
                    });
                }
            },
            preventCancel: false,
            title: $L("DataJog Not Installed"),
            message: $L("DataJog is not installed. Would you like to download it?"),
            choices:[
                {label:$L("Yes"), value:"yes", type:"affirmative"},
                {label:$L("No"), value:"no", type:"dismissal"}
            ]
        });
    },
    relegoFailure: function(event) {
        //--> Relego is not installed, so offer the ability to download
        this.controller.showAlertDialog({
            onChoose: function(value){
                if (value=="yes"){
                    //--> And weee'rrre.. off to see the wizard
                    this.controller.serviceRequest('palm://com.palm.applicationManager', {
                        method:'open',
                        parameters:{
                            target: "http://developer.palm.com/appredirect/?packageid=com.webosroundup.relego"
                        }
                    });
                }
            },
            preventCancel: false,
            title: $L("Relego Not Installed"),
            message: $L("Relego is not installed. Would you like to download it? It's Free!"),
            choices:[
                {label:$L("Yes"), value:"yes", type:"affirmative"},
                {label:$L("No"), value:"no", type:"dismissal"}
            ]
        });
    },
    onFlick: function(event) {
        var x, y;
        
        x = event.velocity.x;
        y = event.velocity.y;
        
        if(Math.abs(x) > Math.abs(y)) {
            if((x < 0) && (this.id < (this.articles.length-1))) {
                Mojo.Controller.stageController.swapScene(
                    {
                        name: "article",
                        disableSceneScroller: true
                    },
                    this.articles,
                    this.id + 1
                );
            }
            else if((x > 0) && (this.id > 0)) {
                Mojo.Controller.stageController.swapScene(
                    {
                        name: "article",
                        disableSceneScroller: true
                    },
                    this.articles,
                    this.id - 1
                );
            }
        }
    },
    showAddComment: function() {
        var replyElem, scroller;
        if((Prefs.username === "") || (Prefs.email === ""))
        {
            this.controller.showDialog({
                template: 'article/username-popup',
                assistant: new UsernamePopupAssistant(this, this.popupDone.bind(this))
            });
        }
        else
        {
            replyElem = $("comment-reply");
            $("reply-button").hide();
            replyElem.show();
            scroller = Mojo.View.getScrollerForElement(replyElem);
            scroller.mojo.revealElement(replyElem);
        }
    },
    popupDone: function() {
        if((Prefs.username !== "") && (Prefs.email !== ""))
        {
            $("reply-button").hide();
            $("comment-reply").show();
        }
    },
    commentSubmit: function() {
        var msg = this.commentMsgModel.value, params;
        if((Prefs.username === "") || (Prefs.email === ""))
        {
            Mojo.Controller.getAppController().showBanner($L("Enter username & e-mail then resubmit"),
                {source: 'notification'});
            Mojo.Controller.stageController.pushScene("preferences");
        }
        else if(msg != "") {
            params = {
                thread_id: this.threadID,
                forum_api_key: "hxGZJwHvRswfHrfeqzutQTyo7mxZ1oXeTj0m1L6hhq0v6o9IaTqtzTYrmu9SfOT1",
                message: msg,
                author_name: Prefs.username,
                author_email: Prefs.email
            };
            if("" !== Prefs.url) {
                params.author_url = Prefs.url;
            }
            if(undefined !== this.parent_post_id)
                params.parent_post = this.parent_post_id;

            this.createCommentRequest = new Ajax.Request("http://disqus.com/api/create_post", {
                method: 'post',
                parameters: params,
                evalJSON: 'force',
                onSuccess: this.commentPosted,
                onFailure: this.commentPostFailure
            });
        }
        else {
            $("comment-status").innerHTML = $L("No comment to post!");
        }
    },
    commentPosted: function(response) {
        $("comment-reply").hide();
        $("comment-status").innerHTML = $L("Your comment has been posted.");
    },
    commentPostFailure: function(response) {
        $("comment-reply").hide();
        $("comment-status").innerHTML = $L("An error occurred while posting your comment.");
    },
    activate: function(event) {
        this.controller.listen(this.controller.window, Mojo.Event.flick, this.onFlick);
    },
    deactivate: function(event) {
        this.controller.stopListening(this.controller.window, Mojo.Event.flick, this.onFlick);
        this.goingAway = true;
    },
    cleanup: function() {
        this.controller.stopListening(this.controller.window, 'resize', this.onResize, false);
        this.controller.stopListening("browserIcon", Mojo.Event.tap, this.onBrowserTap);
        this.controller.stopListening("shareIcon", Mojo.Event.tap, this.onShareTap);
        this.controller.stopListening("articleTitle", Mojo.Event.tap, this.onHeaderTap);
        this.controller.stopListening("reply-button", Mojo.Event.tap, this.showAddComment);
        this.controller.stopListening("submit-button", Mojo.Event.tap, this.commentSubmit);
        this.controller.stopListening('comments', Mojo.Event.tap, this.commentTap);
    }
};

function UsernamePopupAssistant(sceneAssistant, callback) {
    this.sceneAssistant = sceneAssistant;
    this.controller = sceneAssistant.controller;
    this.callback = callback;
}

UsernamePopupAssistant.prototype = {
    setup: function(widget) {
        this.widget = widget;
        
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
                hintText: $L("Enter your email (not shown)"),
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

        this.controller.setupWidget("done-button",
            {},
            {
                buttonLabel: $L("Done")
            });
        
        this.onPropertyChange = this.onPropertyChange.bind(this);
        this.controller.listen("username", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.listen("email", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.listen("url", Mojo.Event.propertyChange, this.onPropertyChange);
        
        this.onDone = this.onDone.bind(this);
        this.controller.listen("done-button", Mojo.Event.tap, this.onDone);
    },
    onPropertyChange: function(event) {
        switch(event.model) {
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
    onDone: function() {
        this.callback();
        this.widget.mojo.close();
    },
    cleanup: function() {
        this.controller.stopListening("username", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.stopListening("email", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.stopListening("url", Mojo.Event.propertyChange, this.onPropertyChange);
        this.controller.stopListening("done-button", Mojo.Event.tap, this.onDone);
    }
};
