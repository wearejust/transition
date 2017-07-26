export var available;
var changing, location, items = [];

$(function() {
    available = !!history.pushState;
    if (!available) {
        trigger('ready');
        return;
    }

    window.addEventListener('popstate', popState);

    parse();
});

function parse() {
    $('a:not([href^="#"],[href^="mailto:"],[href^="tel:"])').each(function(index, item) {
        item = $(item);
        if (!item.data('TransitionItem')) {
            item = new Item(item);
            items.push(item);
        }
    });

    trigger('ready');
}

function popState(e, item) {
    if (changing || location == window.location.href) return;
    changing = true;
    location = window.location.href;
    
    if (!item) {
        let i;
        for (i=0; i<items.length; i++) {
            if (items[i].url == location) {
                item = items[i];
                break;
            }
        }
    }

    
}