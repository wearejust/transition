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
    }
    
    click(e) {
        if (!e.ctrlKey && !e.metaKey && (e.keyCode || e.which == 1)) {
            e.preventDefault();
            window.history.pushState({url : this.url}, '', this.url);
            popState(e, this);
        }
    }
}
