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
    $('a:not([href^="#"])').each(function(index, item) {
        item = $(item);
        if (!item.data('TransitionItem')) {
            item = new Item(item);
            items.push(item);
        }
    });

    trigger('ready');
}

function pushState(url) {
    window.history.pushState({url : url}, '', url);
    popState();
}

function popState() {
    if (changing || location == window.location.href) return;
    changing = true;
    location = window.location.href;
    console.log(location);
}