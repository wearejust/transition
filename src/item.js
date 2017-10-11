let idIndex = 1;

class Item {
    constructor(element) {
        this.element = element;
        this.element.data('TransitionItem', this);
        this.element.on('click', this.click.bind(this));

        this.id = idIndex++;

        this.url = this.element.attr('href');
        if (this.url.indexOf(window.location.origin) == -1) {
            if (this.url.substr(0, 1) != '/') this.url = `/${this.url}`;
            this.url = `${window.location.origin}${this.url}`;
        }

        this.key = this.element.attr('data-transition-key');
        this.type = this.element.attr('data-transition-type');
        this.targetId = this.element.attr('data-transition-target');
        this.update();
    }

    update() {
        if (this.targetId) {
            let target = $(`[data-transition-id="${this.targetId}"]`);
            if (target.length) {
                this.target = target;
                this.targetSelector = `[data-transition-id="${this.targetId}"]`;
            }
        } else if (options.defaultTarget) {
            this.target = $(options.defaultTarget);
            this.targetSelector = options.defaultTarget;
        } else {
            this.target = $body;
            this.targetIsBody = true;
        }
    }
    
    click(e) {
        if (!e || (!e.ctrlKey && !e.metaKey && (e.keyCode || e.which == 1))) {
            if (e) e.preventDefault();
            window.history.pushState({ url: this.url, itemId:this.id }, '', this.url);
            popState();
        }
    }
}
