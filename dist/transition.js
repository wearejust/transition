/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 2.5.3 
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
* @version 2.5.3 
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

        this.key = this.element.attr('data-transition-key');
        this.type = this.element.attr('data-transition-type');
        this.targetId = this.element.attr('data-transition-target');
        this.update();
    }

    Item.prototype.update = function update() {
        if (this.targetId) {
            var target = $('[data-transition-id="' + this.targetId + '"]');
            if (target.length) {
                this.target = target;
                this.targetSelector = '[data-transition-id="' + this.targetId + '"]';
            }
        } else if (options.defaultTarget) {
            this.target = $(options.defaultTarget);
            this.targetSelector = options.defaultTarget;
        } else {
            this.target = $(document.body);
            this.targetIsBody = true;
        }
    };

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
* @version 2.5.3 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.init = init;
exports.parse = parse;
var $ = require('jquery');

var available = exports.available = void 0,
    changing = exports.changing = void 0,
    currentItem = exports.currentItem = void 0,
    currentType = exports.currentType = void 0,
    from = exports.from = void 0,
    items = exports.items = [],
    location = exports.location = window.location.href,
    options = exports.options = void 0,
    types = exports.types = {};

var $window = $(window);

function init(opts) {
    exports.options = options = $.extend({
        defaultTarget: null,
        defaultType: 'fade',
        error: 'reload',
        exclude: null,
        lazyLoad: 'source,iframe',
        parseOnInit: true
    }, opts || {});
}

$(function () {
    if (!options) init();

    exports.available = available = !!history.pushState;
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
    exports.changing = changing = true;

    exports.from = from = location;
    exports.location = location = window.location.href;

    exports.currentItem = currentItem = null;
    var i = void 0;
    if (history.state && history.state.itemId) {
        for (i = 0; i < items.length; i++) {
            if (items[i].id == history.state.itemId) {
                exports.currentItem = currentItem = items[i];
                break;
            }
        }
    }
    if (!currentItem) {
        for (i = 0; i < items.length; i++) {
            if (items[i].url == location) {
                exports.currentItem = currentItem = items[i];
                break;
            }
        }
    }
    if (!currentItem || !currentItem.target) {
        exports.currentItem = currentItem = {
            target: $(options.defaultTarget || document.body),
            targetIsBody: !options.defaultTarget
        };
    }
    currentItem.from = from;

    if (currentItem.type && types[currentItem.type]) {
        exports.currentType = currentType = types[currentItem.type];
    } else {
        exports.currentType = currentType = types[options.defaultType] || {};
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
        exports.location = location = from;
        exports.changing = changing = false;
        options.error.apply(this, arguments);
    } else if (options.error == 'reload') {
        window.location.reload(true);
    }
}

function loaded(data, textStatus, jqXHR) {
    var url = jqXHR.getResponseHeader('X-Location') || jqXHR.getResponseHeader('Location');
    if (url && url != location && url.indexOf(window.location.hostname) != -1) {
        exports.location = location = url;
        window.history.replaceState({ url: url, itemId: history.state ? history.state.itemId : null }, '', url);
    }

    var meta = data.match(/<head[^>]*>[\s\S]*<\/head>/i);
    if (meta && meta[0]) {
        meta = $(meta[0]);
        document.title = meta.filter('title').text();
    }

    var matches = data.match(/<body([\s\S]*?)class="([\s\S]*?)"([\s\S]*?)>/i);
    currentItem.bodyClass = matches && matches[2] ? matches[2] : '';

    trigger('loaded', data);

    if (data.indexOf('<body') == -1) data = '<body>' + data;
    if (data.indexOf('</body>') == -1) data = data + '</body>';
    data = data.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
    var content = $(data);
    if (!content.length) content = $('<div class="transition-content">' + data + '</div>');

    if (options.lazyLoad) {
        content.filter(options.lazyLoad).add(content.find(options.lazyLoad)).each(function (index, item) {
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

    $('a[href]:not(.no-transition,[href^="#"],[href^="mailto:"],[href^="tel:"],[href^="http"]:not([href^="' + window.location.origin + '"]))').not(options.exclude).each(function (index, item) {
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

    exports.changing = changing = false;
    if (location != window.location.href) {
        popState();
    }
}
/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 2.5.3 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

types.fade = {
    duration: 500,

    before: function before(target, callback) {
        target.css('transition', 'opacity ' + this.duration + 'ms');
        callback();
    },

    start: function start(target, callback) {
        target.css('opacity', 0);
        setTimeout(callback.bind(this), this.duration);
    },

    end: function end(target, callback) {
        target.css('opacity', 1);
        setTimeout(callback.bind(this), this.duration);
    },

    after: function after(target, callback) {
        target.css({
            'transition': '',
            'opacity': ''
        });
        callback();
    }
};
/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 2.5.3 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

types.slide = types['slide-left'] = {
    replace: false,
    duration: 800,
    direction: -1,
    ease: 'ease-in-out',

    start: function start(target, callback) {
        this.top = $window.scrollTop();

        var offset = target.offset();
        target.css({
            'left': offset.left + 'px',
            'top': offset.top - this.top + 'px',
            'position': 'fixed',
            'height': target.outerHeight() + 'px',
            'width': target.outerWidth() + 'px'
        });

        setTimeout(function () {
            $('body,html').scrollTop(0);
            callback();
        });
    },

    place: function place(target, content) {
        target.css('transition', 'transform ' + (this.duration || 0) + 'ms ' + this.ease);

        this.next = target.clone();
        this.next.find(':not(script)').remove();
        this.next.append(content);

        var offset = target.offset();
        this.next.css({
            'left': offset.left + 'px',
            'top': offset.top + this.top + 'px',
            'position': 'absolute',
            'width': target.outerWidth() + 'px',
            'transform': 'translateX(' + -this.direction + '00vw)'
        });

        target.after(this.next);
    },

    end: function end(target, callback) {
        var _this = this;

        target.css('transform', 'translateX(' + this.direction + '00vw)');
        this.next.css('transform', 'translateX(0)');

        setTimeout(function () {
            target.remove();
            _this.next.css({
                'left': '',
                'top': '',
                'position': '',
                'height': '',
                'width': '',
                'transform': '',
                'transition': ''
            });
            callback();
        }, this.duration);
    }
};

types['slide-right'] = $.extend({}, types['slide-left'], {
    direction: 1
});