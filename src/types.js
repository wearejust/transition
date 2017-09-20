export var types = {};

types.default = types.fade = {
    before: function(item, callback) {
        item.target.stop(true).fadeOut().queue(callback);
    },
    after: function(item, callback) {
        item.target.stop(true).fadeIn().queue(callback);
    }
};

types.slide = types['slide-left'] = {
    append: true,
    duration: 800,
    direction: -1,
    ease: 'ease-in-out',
    start: function(item, callback) {
        this.previous = item.target.children().wrapAll(`<div></div>`).parent();
        callback();
    },
    end: function(item, callback) {
        let offset = item.target.offset();
        let style = `position: absolute;
                    left: 0;
                    padding: ${offset.top}px ${offset.left}px;
                    width: ${offset.left * 2 + item.target.outerWidth()}px;
                    min-height: ${offset.top * 2 + item.target.outerHeight()}px;
                    transition: transform ${this.duration/1000}s ${this.ease};`;

        this.next = item.target.children(':not(:first-child)').wrapAll(`<div style="${style} top: 0; transform: translateX(${-this.direction}00vw);"></div>`).parent();
        this.previous.attr('style', `${style} top: -${$window.scrollTop()}px; transform: translateX(0);`);

        $window.scrollTop(0);

        setTimeout(() => {
            this.previous.css('transform', `translateX(${this.direction}00vw)`);
            this.next.css('transform', 'translateX(0)');

            setTimeout(() => {
                this.previous.remove();
                this.next.contents().unwrap();
                callback();
            }, this.duration);
        }, 10);
    }
};

types['slide-right'] = $.extend({}, types['slide-left'], {
    direction: 1
});