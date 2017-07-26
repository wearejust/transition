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

function popState(e, item) {
    if (changing || location == window.location.href) return;
    
    if (!item) {
        let i;
        for (i=0; i<items.length; i++) {
            if (items[i].url == location) {
                item = items[i];
                break;
            }
        }
    }
    
    if (item) {
        changing = true;
        location = window.location.href;

        $.ajax({
            url: item.url,
            success: parse
        });
    }
}

function parse(data) {
    if (data) {
        let meta = $(data.match(/<head[^>]*>[\s\S]*<\/head>/i)[0]);
        document.title = meta.filter('title').text();
    }
    
    $('a:not([href^="#"],[href^="mailto:"],[href^="tel:"])').each(function(index, item) {
        item = $(item);
        if (!item.data('TransitionItem')) {
            item = new Item(item);
            items.push(item);
        }
    });

    trigger('ready');
}