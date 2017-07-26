export var available;
var $body = $(document.body);
var changing, location, items = [];

$(function() {
    available = !!history.pushState;
    if (!available) {
        trigger('ready');
        return;
    }
    
    window.addEventListener('popstate', popState);

    parse();
    trigger('ready');
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

        trigger('change');

        $.ajax({
            url: item.url,
            success: parse,
            complete: complete
        });
    }
}

function parse(data) {
    if (data) {
        let meta = $(data.match(/<head[^>]*>[\s\S]*<\/head>/i)[0]);
        document.title = meta.filter('title').text();

        if (data.indexOf('</body>') == -1) data = `${data}</body>`;
        let b = data.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
        b = b.replace(/<script[\s\S]*<\/script>/gi, '');
        $body.find(':not(script)').remove();
        $body.prepend(b);
    }
    
    $('a:not([href^="#"],[href^="mailto:"],[href^="tel:"])').each(function(index, item) {
        item = $(item);
        if (!item.data('TransitionItem')) {
            item = new Item(item);
            items.push(item);
        }
    });

    trigger('parse');
}

function complete() {
    changing = false;
    if (location != window.location.href) {
        popState();
    } else {
        trigger('ready');
        trigger('complete');
    }
}