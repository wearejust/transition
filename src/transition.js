const $ = require('jquery');

export let available,
    changing,
    currentItem,
    currentType,
    from,
    items = [],
    location = window.location.href,
    options,
    types = {};

let $window = $(window);

export function init(opts) {
    options = $.extend({
        defaultTarget: null,
        defaultType: 'fade',
        error: 'reload',
        exclude: null,
        lazyLoad: 'source,iframe',
        parseOnInit: true
    }, opts || {});
}

$(function() {
    if (!options) init();

    available = !!history.pushState;
    if (!available) {
        trigger('unavailable ready');
        return;
    }

    $window.on('keyup', keyup);
    $window.on('popstate', popState);

    if (options.parseOnInit) {
        parse();
    }

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

    from = location;
    location = window.location.href;

    currentItem = null;
    let i;
    if (history.state && history.state.itemId) {
        for (i=0; i<items.length; i++) {
            if (items[i].id == history.state.itemId) {
                currentItem = items[i];
                break;
            }
        }
    }
    if (!currentItem) {
        for (i=0; i<items.length; i++) {
            if (items[i].url == location) {
                currentItem = items[i];
                break;
            }
        }
    }
    if (!currentItem || !currentItem.target) {
        currentItem = {
            target: $(options.defaultTarget || document.body),
            targetIsBody: !options.defaultTarget
        };
    }
    currentItem.from = from;

    if (currentItem.type && types[currentItem.type]) {
        currentType = types[currentItem.type];
    } else {
        currentType = types[options.defaultType] || {};
    }
    currentType.clone = null;

    trigger('change', location);

    trigger('before');
    if (currentType.before) {
        currentType.before(currentItem.target, start);
    } else {
        start();
    }
}

function start() {
    trigger('start');
    if (currentType.start) {
        currentType.start(currentItem.target, load);
    } else {
        load();
    }
}

function load() {
    trigger('load');

    $.ajax({
        url: location,
        error: error,
        success: loaded
    });
}

function error() {
    if ($.isFunction(options.error)) {
        location = from;
        changing = false;
        options.error.apply(this, arguments);
    } else if (options.error == 'reload') {
        window.location.reload(true);
    }
}

function loaded(data, textStatus, jqXHR) {
    let url = jqXHR.getResponseHeader('X-Location') || jqXHR.getResponseHeader('Location');
    if (url && url != location && url.indexOf(window.location.hostname) != -1) {
        location = url;
        window.history.replaceState({ url: url, itemId:history.state ? history.state.itemId : null }, '', url);
    }

    let meta = data.match(/<head[^>]*>[\s\S]*<\/head>/i);
    if (meta && meta[0]) {
        meta = $(meta[0]);
        document.title = meta.filter('title').text();
    }

    let matches = data.match(/<body([\s\S]*?)class="([\s\S]*?)"([\s\S]*?)>/i);
    currentItem.bodyClass = (matches && matches[2]) ? matches[2] : '';

    trigger('loaded', data);

    if (data.indexOf('<body') == -1) data = `<body>${data}`;
    if (data.indexOf('</body>') == -1) data = `${data}</body>`;
    data = data.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
    let content = $(data);
    if (!content.length) content = $(`<div class="transition-content">${data}</div>`);

    if (options.lazyLoad) {
        content.filter(options.lazyLoad).add(content.find(options.lazyLoad)).each(function(index, item) {
            item = $(item);
            item.attr('data-transition-lazyload-src', item.attr('src'));
            item.removeAttr('src');
            item.attr('data-transition-lazyload-srcset', item.attr('srcset'));
            item.removeAttr('srcset');
        });
    }

    if (currentItem.targetIsBody) {
        if (currentType.replace !== false) {
            $(document.body).find(':not(script)').remove();
        }
    } else {
        content.find('script').remove();
        if (currentItem.targetSelector) {
            content = $(content.filter(currentItem.targetSelector).add(content.find(currentItem.targetSelector)).html() || content);
        }
        if (currentType.replace !== false) {
            currentItem.target.empty();
        }
    }

    if (currentType.place) {
        currentType.place(currentItem.target, content);
    } else {
        currentItem.target.append(content);
    }

    if (content.hasClass('transition-content')) {
        content.unwrap();
    }

    trigger('placed', content);

    if (currentType.scrollToTop !== false) {
        $('body,html').scrollTop(0);
    }

    setTimeout(loadComplete, 100);
}

function loadComplete() {
    trigger('end');
    if (currentType.end) {
        currentType.end(currentItem.target, after);
    } else {
        after();
    }
}

function after() {
    trigger('after');
    if (currentType.after) {
        currentType.after(currentItem.target, complete);
    } else {
        complete();
    }
}

export function parse() {
    let item, i = 0;
    while (i < items.length) {
        item = items[i];
        if (!item.element.closest('body').length) {
            items.splice(i, 1);
        } else {
            i++;
        }
    }

    $(`a[href]:not(.no-transition,[href^="#"],[href^="mailto:"],[href^="tel:"],[href^="http"]:not([href^="${window.location.origin}"]))`).not(options.exclude).each(function(index, item) {
        item = $(item);
        if (!item.data('TransitionItem')) {
            item = new Item(item);
            items.push(item);
        } else {
            item.data('TransitionItem').update();
        }
    });

    trigger('parse', items);
}

function complete() {
    parse();

    if (options.lazyLoad) {
        $('[data-transition-lazyload-src]').each(function (index, item) {
            item = $(item);
            item.attr('src', item.attr('data-transition-lazyload-src'));
            item.removeAttr('data-transition-lazyload-src');
            item.attr('srcset', item.attr('data-transition-lazyload-srcset'));
            item.removeAttr('data-transition-lazyload-srcset');
        });
    }

    trigger('complete');

    changing = false;
    if (location != window.location.href) {
        popState();
    }
}