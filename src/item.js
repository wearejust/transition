class Item {
    constructor(element) {
        this.element = element;
        this.element.data('TransitionItem', this);
        this.element.on('click', this.click.bind(this));
        this.url = this.element.attr('href');
    }
    
    click(e) {
        if (!e.ctrlKey && !e.metaKey && (e.keyCode || e.which == 1)) {
            e.preventDefault();
            pushState(this.url);
        }
    }
}
