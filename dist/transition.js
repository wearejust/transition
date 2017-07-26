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
    }

    Item.prototype.click = function click(e) {
        if (!e.ctrlKey && !e.metaKey && (e.keyCode || e.which == 1)) {
            e.preventDefault();
            pushState(this.url);
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
var changing,
    location,
    items = [];

$(function () {
    exports.available = available = !!history.pushState;
    if (!available) {
        trigger('ready');
        return;
    }

    window.addEventListener('popstate', popState);

    parse();
});

function parse() {
    $('a:not([href^="#"])').each(function (index, item) {
        item = $(item);
        if (!item.data('TransitionItem')) {
            item = new Item(item);
            items.push(item);
        }
    });

    trigger('ready');
}

function pushState(url) {
    window.history.pushState({ url: url }, '', url);
    popState();
}

function popState() {
    if (changing || location == window.location.href) return;
    changing = true;
    location = window.location.href;
    console.log(location);
}