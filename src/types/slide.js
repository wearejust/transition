types.slide = types['slide-left'] = {
    replace: false,
    duration: 800,
    direction: -1,
    ease: 'ease-in-out',

    start: function(target, callback) {
        this.top = $window.scrollTop();

        let offset = target.offset();
        target.css({
            'left': `${offset.left}px`,
            'top': `${offset.top - this.top}px`,
            'position': 'fixed',
            'height': `${target.outerHeight()}px`,
            'width': `${target.outerWidth()}px`
        });

        setTimeout(function() {
            $window.scrollTop(0);

            setTimeout(function() {
                target.css({
                    position: '',
                    top: '',
                    left: '',
                    width: '',
                    height: '',
                    transform: `translate3d(0, -${this.top}px, 0)`
                });

                callback();
            }.bind(this));
        }.bind(this));
    },

    place: function(target, content) {
        target.css('transition', `transform ${this.duration || 0}ms ${this.ease}`);

        this.next = target.clone();
        this.next.find(':not(script)').remove();
        this.next.append(content);

        let offset = target.offset();
        this.next.css({
            'left': `${offset.left}px`,
            'top': `${offset.top + this.top}px`,
            'position': 'absolute',
            'width': `${target.outerWidth()}px`,
            'transform': `translateX(${-this.direction}00vw)`
        });

        target.after(this.next);
    },

    end: function(target, callback) {
        target.css('transform', `translate3d(${this.direction}00vw, -${this.top}px, 0)`);
        this.next.css('transform', 'translateX(0)');

        setTimeout(() => {
            target.remove();
            this.next.css({
                'left': '',
                'top': '',
                'position': '',
                'width': '',
                'transform': '',
                'transition': ''
            });
            callback();
        }, this.duration);
    }
};

types['slide-right'] = $.extend({}, types['slide-left'], {
    direction: 1
});