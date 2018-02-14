# Transition
Easily add transitions between pages. Either use the built in types like fade or slide, or add your own custom transition. 

## Installation
```console
npm install @wearejust/transition --save
```

## Usage
```javascript
var Transition = require('@wearejust/transition');
```

### Options
Transition will initialize automatically, but if you want to change any of it's options, use the `init` method.
```javascript
Transition.init({
    defaultTarget: '#container'
});
```

| Key | Values | Default | Description |
|---|---|---|---|
| defaultTarget | string, null | null | Default target. Null uses the body |
| defaultType | string | fade | Default transition type |
| error | string, function | reload | Error callback. Use 'reload' to reload the page or call your own function |
| exclude | string, null | null | Items to exclude from parsing. Can also use 'no-transition' class |
| lazyLoad | string, null | source,iframe | Removes sources in loaded data and restores after the transition |
| parseOnInit | boolean | true | Parse document for items on init |

## Targets
Changes the contents of the target, instead of the whole body.
```html
 <a data-transition-target="yourtarget"></a>
 <div data-transition-id="yourtarget"></div>
```

## Transition types
There are several transition types built in. The default `fade` can be changed in the options.

| Name | Description |
|---|---|
| fade | Fade out old, fade in new |
| slide | Same as `slide-left` |
| slide-left | Place new content on the right and slide to the left |
| slide-right | Place new content on the left and slide to the right |

Every item can have it's own transition type with a data atribute.
```html
<a href="" data-transition-type="fade">Fade</a>
<a href="" data-transition-type="slide">Slide</a>
````

Adding custom type 'yourtype':
```html
<a href="" data-transition-type="yourtype"></a>
````
```javascript
Transition.types.yourtype = {
    replace: true,                          // Replaces the content after load. Set to false to use previous content in transition, like when sliding
    scrollToTop: true,                      // Scrolls to the top after placing the content
    before: function(target, callback) {    // Before starting
        callback();                         // Call once done to continue to start
    },
    start: function(target, callback) {     // Before loading
        callback();                         // Call once done to continue to load
    },
    place: function(target, content) {     // Custom placing of the content, default is null
        
    },
    end: function(target, callback) {       // After loading
        callback();                         // Call once done to continue to after
    },
    after: function(target, callback) {     // After end
        callback();                         // Call once done to complete
    }
};
```

## Events
Events are triggered on every step during the transition. Use the `on` method to trigger an event handler.
```javascript
Transition.on('ready', function() {
    // Do something after initializing or loading a new page
});
```

Available events, in order in which they are triggered.

| Name | Parameters | Description |
|---|---|---|
| unavailable | | History API is not available, transitions disabled |
| available | | History API is available, transitions enabled |
| ready | | Ready, after initializing |
| change | | Location has changed (using popState) |
| before | | Before the `start` transition |
| start | | Start transition |
| load | | Load page |
| loaded | data | Page is loaded | 
| placed | content | Content of the loaded page is placed in the DOM | 
| end | | End transition |
| after | | After the `end` transition |
| parse | items | After parsing new content for items | 
| complete |  | Completed transition |

## Keyboard events
Binds keys to items. If a bound key is pressed, that item will be triggered.
```html
 <a data-transition-key="27">Close</a>
 <a data-transition-key="37">Previous</a>
 <a data-transition-key="39">Next</a>
```

## Properties
### Transition
| Name | Type | Description |
|---|---|---|
| available | boolean | History API availability |
| changing | boolean | Set to true before animating, to false when done |
| currentItem | object | The current clicked item |
| currentType | object | The current transition type |
| from | string | Previous location.href |
| location | string | Current location.href |
| items | array | List of all items on the page |
| options | object | Options of Transition |
| types | object | Collection of all transition types |

### Transition.currentItem
| Name | Type | Description |
|---|---|---|
| bodyClass | string | Class attribute of the loaded body |
| element | jQuery object | DOM element |
| from | string | Previous location.href |
| target | jQuery object | Target container |
| targetIsBody | boolean | If target container is the body |
| type | string | Transition type |
| url | string | DOM element href |
