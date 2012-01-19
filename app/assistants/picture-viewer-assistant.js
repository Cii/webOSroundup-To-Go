function PictureViewerAssistant(images) {
    this.images = images;
}

PictureViewerAssistant.prototype = {
    setup: function() {
        this.onResize = this.onResize.bindAsEventListener(this);
        this.controller.listen(this.controller.window, 'resize', this.onResize, false);
        
        this.imageViewer = this.controller.get('divImageViewer');
        this.controller.setupWidget('divImageViewer',
            { noExtractFS: true },
            this.model = {}
        );
    },
    activate: function(event) {
        this.controller.enableFullScreenMode(true);
        this.imageViewer.mojo.centerUrlProvided(this.images);
    },
    onResize: function(event) {
        if(this.imageViewer && this.imageViewer.mojo) {
            this.imageViewer.mojo.manualSize(this.controller.window.innerWidth, this.controller.window.innerHeight);
        }
    },
    deactivate: function(event) {
    },
    cleanup: function() {
        this.controller.stopListening(this.controller.window, 'resize', this.onResize, false);
    }
};