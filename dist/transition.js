/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 1.0.3 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.on = on;
exports.trigger = trigger;
var events = {};

function on(names, callback) {
    names.split(' ').map(function (name) {
        if (!events[name]) events[name] = [];
        events[name].push(callback);
    });
}

function trigger(names, data) {
    var event = void 0,
        callback = void 0;
    names.split(' ').map(function (name) {
        event = events[name];
        for (callback in event) {
            event[callback](data, name);
        }
    });
}
/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 1.0.3 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Item = function () {
    function Item(element) {
        _classCallCheck(this, Item);

        this.element = element;
        this.element.data('TransitionItem', this);
        this.element.on('click', this.click.bind(this));

        this.url = this.element.attr('href');
        if (this.url.indexOf(window.location.origin) == -1) {
            if (this.url.substr(0, 1) != '/') this.url = '/' + this.url;
            this.url = '' + window.location.origin + this.url;
        }

        var targetId = this.element.attr('data-transition-target');
        if (targetId) {
            var target = $('[data-transition-id="' + targetId + '"]');
            if (target.length) {
                this.target = target;
                this.targetSelector = '[data-transition-id="' + targetId + '"]';
            }
        } else if (options.defaultTarget) {
            this.target = $(options.defaultTarget);
            this.targetSelector = options.defaultTarget;
        } else {
            this.target = $body;
            this.targetIsBody = true;
        }

        this.key = this.element.attr('data-transition-key');
        this.type = this.element.attr('data-transition-type');
    }

    Item.prototype.click = function click(e) {
        if (!e || !e.ctrlKey && !e.metaKey && (e.keyCode || e.which == 1)) {
            if (e) e.preventDefault();
            window.history.pushState({ url: this.url }, '', this.url);
            popState();
        }
    };

    return Item;
}();
/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 1.0.3 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var available = exports.available = undefined;
var types = exports.types = {};
var options = exports.options = {
    scroll: true,
    scrollDuration: 500
};

var $body = $(document.body);
var $bodyHtml = $('body,html');
var $window = $(window);
var changing,
    location = window.location.href,
    items = [];

$(function () {
    exports.available = available = !!history.pushState;
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
        var i = void 0,
            item = void 0;
        for (i = 0; i < items.length; i++) {
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

    var from = location;
    location = window.location.href;

    var item = findItem();
    item.from = from;

    if (options.scroll) {
        var top = item && item.target ? item.target.offset().top : 0;
        if ($.isFunction(options.scrollOffset)) {
            top += options.scrollOffset();
        } else if (!isNaN(options.scrollOffset)) {
            top += options.scrollOffset;
        }

        $bodyHtml.stop(true).animate({
            scrollTop: top
        }, {
            duration: options.scrollDuration
        });
    }

    trigger('change');

    var type = findType(item);
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
    var meta = $(data.match(/<head[^>]*>[\s\S]*<\/head>/i)[0]);
    document.title = meta.filter('title').text();

    if (data.indexOf('</body>') == -1) data = data + '</body>';
    var content = data.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
    content = $(content.replace(/<script[\s\S]*<\/script>/gi, ''));

    var item = findItem();
    if (!item || item.targetIsBody) {
        $body.find(':not(script)').remove();
        $body.prepend(content);
    } else {
        content = content.filter(item.targetSelector).add(content.find(item.targetSelector));
        item.target.html(content.html());
    }

    setTimeout(function () {
        parse();

        trigger('loaded', content);

        var type = findType(item);
        if (type && type.after) {
            type.after(item, complete);
        } else {
            complete();
        }
    }, 100);
}

function parse() {
    var item = void 0,
        i = 0;
    while (i < items.length) {
        item = items[i];
        if (!item.element.closest('body').length) {
            items.splice(i, 1);
        } else {
            i++;
        }
    }

    $('a[href]:not(.no-transition,[href^="#"],[href^="mailto:"],[href^="tel:"],[href^="http"]:not([href^="' + window.location.origin + '"]))').each(function (index, item) {
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
    var i = void 0,
        item = void 0;
    for (i = 0; i < items.length; i++) {
        if (items[i].url == location) {
            item = items[i];
            break;
        }
    }
    return item;
}

function findType(item) {
    var type = types.default;
    if (item && item.type) {
        type = types[item.type];
    }
    return type;
}