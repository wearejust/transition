types.fade = {
    duration: 500,

    before: function(target, callback) {
        target.css('transition', `opacity ${this.duration}ms`);
        callback();
    },

    start: function(target, callback) {
        target.css('opacity', 0);
        setTimeout(callback.bind(this), this.duration);
    },

    end: function(target, callback) {
        target.css('opacity', 1);
        setTimeout(callback.bind(this), this.duration);
    },

    after: function(target, callback) {
        target.css({
            'transition': '',
            'opacity': ''
        });
        callback();
    }
};