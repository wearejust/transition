export var available;
export var options = {
    scroll: true,
    scrollDuration: 500
};

var $body = $(document.body);
var $bodyHtml = $('body,html');
var $window = $(window);
var changing, location, items = [];

$(function() {
    available = !!history.pushState;
    if (!available) {
        trigger('ready');
        return;
    }

    $window.on('keyup', keyup);
    $window.on('popstate', popState);

    parse();
    trigger('ready');
});

function keyup(e) {
    let i;
    for (i=0; i<items.length; i++) {
        if (items[i].key == e.keyCode) {
            items[i].click();
            break;
        }
    }
}

function popState() {
    if (changing || location == window.location.href) return;
    changing = true;
    location = window.location.href;

    trigger('change');

    $.ajax({
        url: location,
        success: parse,
        complete: complete
    });
}

function parse(data) {
    let item;
    if (data) {
        let meta = $(data.match(/<head[^>]*>[\s\S]*<\/head>/i)[0]);
        document.title = meta.filter('title').text();

        let i;
        for (i=0; i<items.length; i++) {
            if (items[i].url == location) {
                item = items[i];
                break;
            }
        }

        if (data.indexOf('</body>') == -1) data = `${data}</body>`;
        let content = data.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
        content = $(content.replace(/<script[\s\S]*<\/script>/gi, ''));

        if (!item || !item.target) {
            $body.find(':not(script)').remove();
            $body.prepend(content);
        } else {
            content = content.find(`[data-transition-id="${item.targetId}"]`);
            item.target.html(content.html());
        }
    }

    $(`a:not(.no-transition,[href^="#"],[href^="mailto:"],[href^="tel:"],[href^="http"]:not([href^="${window.location.origin}"]))`).each(function(index, item) {
        item = $(item);
        if (!item.data('TransitionItem')) {
            item = new Item(item);
            items.push(item);
        }
    });

    if (options.scroll) {
        $bodyHtml.stop(true).animate({
            scrollTop: (item && item.target) ? item.target.offset().top : 0
        },{
            duration: options.scrollDuration
        });
    }

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