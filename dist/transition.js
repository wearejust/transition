/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 1.0.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.on = on;
exports.trigger = trigger;
var events = {};

function on(event, callback) {
    if (!events[event]) events[event] = [];
    events[event].push(callback);
}

function trigger(event, data) {
    event = events[event];
    var callback = void 0;
    for (callback in event) {
        event[callback](data);
    }
}
/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 1.0.0 
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

        this.targetId = this.element.attr('data-transition-target');
        if (this.targetId) {
            var target = $('[data-transition-id="' + this.targetId + '"]');
            if (target.length) {
                this.target = target;
            }
        }

        this.key = this.element.attr('data-transition-key');
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
* @version 1.0.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var available = exports.available = undefined;
var options = exports.options = {
    scroll: true,
    scrollDuration: 500
};

var $body = $(document.body);
var $bodyHtml = $('body,html');
var $window = $(window);
var changing,
    location,
    items = [];

$(function () {
    exports.available = available = !!history.pushState;
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
    var i = void 0;
    for (i = 0; i < items.length; i++) {
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
    var item = void 0;
    if (data) {
        var meta = $(data.match(/<head[^>]*>[\s\S]*<\/head>/i)[0]);
        document.title = meta.filter('title').text();

        var i = void 0;
        for (i = 0; i < items.length; i++) {
            if (items[i].url == location) {
                item = items[i];
                break;
            }
        }

        if (data.indexOf('</body>') == -1) data = data + '</body>';
        var content = data.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
        content = $(content.replace(/<script[\s\S]*<\/script>/gi, ''));

        if (!item || !item.target) {
            $body.find(':not(script)').remove();
            $body.prepend(content);
        } else {
            content = content.find('[data-transition-id="' + item.targetId + '"]');
            item.target.html(content.html());
        }
    }

    $('a:not(.no-transition,[href^="#"],[href^="mailto:"],[href^="tel:"],[href^="http"]:not([href^="' + window.location.origin + '"]))').each(function (index, item) {
        item = $(item);
        if (!item.data('TransitionItem')) {
            item = new Item(item);
            items.push(item);
        }
    });

    if (options.scroll) {
        $bodyHtml.stop(true).animate({
            scrollTop: item && item.target ? item.target.offset().top : 0
        }, {
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