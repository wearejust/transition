class Item {
    constructor(element) {
        this.element = element;
        this.element.data('TransitionItem', this);
        this.element.on('click', this.click.bind(this));

        this.url = this.element.attr('href');
        if (this.url.indexOf(window.location.origin) == -1) {
            if (this.url.substr(0, 1) != '/') this.url = `/${this.url}`;
            this.url = `${window.location.origin}${this.url}`;
        }
        
        let targetId = this.element.attr('data-transition-target');
        if (targetId) {
            let target = $(`[data-transition-id="${targetId}"]`);
            if (target.length) {
                this.target = target;
                this.targetSelector = `[data-transition-id="${targetId}"]`;
            }
        } else if (options.defaultTarget) {
            this.target = $(options.defaultTarget);
            this.targetSelector = options.defaultTarget;
        } else {
            this.target = $body;
            this.targetIsBody = true;
        }

        this.key = this.element.attr('data-transition-key');
        this.type = this.element.attr('data-transition-type');
    }
    
    click(e) {
        if (!e || (!e.ctrlKey && !e.metaKey && (e.keyCode || e.which == 1))) {
            if (e) e.preventDefault();
            window.history.pushState({url : this.url}, '', this.url);
            popState();
        }
    }
}
