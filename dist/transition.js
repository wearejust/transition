/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 1.1.0 
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
* @version 1.1.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var idIndex = 1;

var Item = function () {
    function Item(element) {
        _classCallCheck(this, Item);

        this.element = element;
        this.element.data('TransitionItem', this);
        this.element.on('click', this.click.bind(this));

        this.id = idIndex++;

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
            window.history.pushState({ url: this.url, itemId: this.id }, '', this.url);
            popState();
        }
    };

    return Item;
}();
/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 1.1.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parse = parse;
var available = exports.available = undefined;
var options = exports.options = {
    scroll: false,
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
    if (item) item.from = from;

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
    var type = findType(item);

    if (!item || item.targetIsBody) {
        if (type && type.prepend) {
            $body.prepend(content);
        } else if (type && type.append) {
            $body.append(content);
        } else {
            $body.find(':not(script)').remove();
            $body.prepend(content);
        }
    } else {
        content = content.filter(item.targetSelector).add(content.find(item.targetSelector)).html();
        if (type && type.prepend) {
            item.target.prepend(content);
        } else if (type && type.append) {
            item.target.append(content);
        } else {
            item.target.html(content);
        }
    }

    setTimeout(function () {
        parse();

        trigger('loaded', content);

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
        item = void 0,
        key = 'url',
        value = location;

    if (history.state && history.state.itemId) {
        key = 'id';
        value = history.state.itemId;
    }

    for (i = 0; i < items.length; i++) {
        if (items[i][key] == value) {
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
/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 1.1.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var types = exports.types = {};

types.default = types.fade = {
    before: function before(item, callback) {
        item.target.stop(true).fadeOut().queue(callback);
    },
    after: function after(item, callback) {
        item.target.stop(true).fadeIn().queue(callback);
    }
};

types.slide = types['slide-left'] = {
    append: true,
    duration: 800,
    direction: -1,
    ease: 'ease-in-out',
    before: function before(item, callback) {
        this.previous = item.target.children().wrapAll('<div></div>').parent();
        callback();
    },
    after: function after(item, callback) {
        var _this = this;

        var offset = item.target.offset();
        var style = 'position: absolute;\n                    left: 0;\n                    padding: ' + offset.top + 'px ' + offset.left + 'px;\n                    width: ' + (offset.left * 2 + item.target.outerWidth()) + 'px;\n                    min-height: ' + (offset.top * 2 + item.target.outerHeight()) + 'px;\n                    transition: transform ' + this.duration / 1000 + 's ' + this.ease + ';';

        this.next = item.target.children(':not(:first-child)').wrapAll('<div style="' + style + ' top: 0; transform: translateX(' + -this.direction + '00vw);"></div>').parent();
        this.previous.attr('style', style + ' top: -' + $window.scrollTop() + 'px; transform: translateX(0);');

        $window.scrollTop(0);

        setTimeout(function () {
            _this.previous.css('transform', 'translateX(' + _this.direction + '00vw)');
            _this.next.css('transform', 'translateX(0)');

            setTimeout(function () {
                _this.previous.remove();
                _this.next.contents().unwrap();
                callback();
            }, _this.duration);
        }, 10);
    }
};

types['slide-right'] = $.extend({}, types['slide-left'], {
    direction: 1
});