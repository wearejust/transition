export var available;
export var types = {};
export var options = {
    scroll: true,
    scrollDuration: 500
};

var $body = $(document.body);
var $bodyHtml = $('body,html');
var $window = $(window);
var changing, location = window.location.href, items = [];

$(function() {
    available = !!history.pushState;
    if (!available) {
        trigger('unavailable ready');
        return;
    }

    $window.on('keyup', keyup);
    $window.on('popstate', popState);

    parse();
    trigger('available ready');
});

function keyup(e) {
    if (e.keyCode) {
        let i, item;
        for (i=0; i<items.length; i++) {
            item = items[i];
            if (item.key && item.key == e.keyCode) {
                item.click();
                break;
            }
        }
    }
}

function popState() {
    if (changing || location == window.location.href) return;
    changing = true;

    let from = location;
    location = window.location.href;

    let item = findItem();
    item.from = from;

    if (options.scroll) {
        let top = (item && item.target) ? item.target.offset().top : 0;
        if ($.isFunction(options.scrollOffset)) {
            top += options.scrollOffset();
        } else if (!isNaN(options.scrollOffset)) {
            top += options.scrollOffset;
        }

        $bodyHtml.stop(true).animate({
            scrollTop: top
        },{
            duration: options.scrollDuration
        });
    }

    trigger('change');

    let type = findType(item);
    if (type && type.before) {
        type.before(item, load);
    } else {
        load();
    }
}

function load() {
    trigger('load');

    $.ajax({
        url: location,
        success: loaded
    });
}

function loaded(data) {
    let meta = $(data.match(/<head[^>]*>[\s\S]*<\/head>/i)[0]);
    document.title = meta.filter('title').text();

    if (data.indexOf('</body>') == -1) data = `${data}</body>`;
    let content = data.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
    content = $(content.replace(/<script[\s\S]*<\/script>/gi, ''));

    let item = findItem();
    if (!item || item.targetIsBody) {
        $body.find(':not(script)').remove();
        $body.prepend(content);
    } else {
        content = content.filter(item.targetSelector).add(content.find(item.targetSelector));
        item.target.html(content.html());
    }

    setTimeout(function() {
        parse();

        trigger('loaded', content);

        let type = findType(item);
        if (type && type.after) {
            type.after(item, complete);
        } else {
            complete();
        }
    }, 100);
}

function parse() {
    let item, i = 0;
    while (i < items.length) {
        item = items[i];
        if (!item.element.closest('body').length) {
            items.splice(i, 1);
        } else {
            i++;
        }
    }

    $(`a[href]:not(.no-transition,[href^="#"],[href^="mailto:"],[href^="tel:"],[href^="http"]:not([href^="${window.location.origin}"]))`).each(function(index, item) {
        item = $(item);
        if (!item.data('TransitionItem')) {
            item = new Item(item);
            items.push(item);
        }
    });

    trigger('parse', items);
}

function complete() {
    changing = false;
    if (location != window.location.href) {
        popState();
    } else {
        trigger('complete');
    }
}

function findItem() {
    let i, item;
    for (i=0; i<items.length; i++) {
        if (items[i].url == location) {
            item = items[i];
            break;
        }
    }
    return item;
}

function findType(item) {
    let type = types.default;
    if (item && item.type) {
        type = types[item.type];
    }
    return type;
}