# Transition

### Installation
```
npm install @wearejust/transition --save
```

### Usage
```javascript
var Transition = require('@wearejust/transition');
```

### Events
```javascript
Transition.on('ready', function() {
    // Do something after initializing or loading a new page
});
```

### Options
Default
```javascript
Transition.options.error = null;            // Error callback, null reloads the page
Transition.options.scroll = false;          // Scroll up on change
Transition.options.scrollDuration = 500;    // Duration of scroll
```
Optional
```javascript
Transition.options.defaultTarget = '.target-selector';      // Target container to load content into
Transition.options.scrollOffset = 100;                      // Scroll offset from top in pixels 
```

### Types
Adding a default
```javascript
Transition.types.default = {
    // Fade out before loading
    before: function(item, callback) {
        item.target.stop(true).fadeOut().queue(callback);
    },
    // Fade in after loading
    after: function(item, callback) {
        item.target.stop(true).fadeIn().queue(callback);
    }
};
```
Adding custom 'yourtype'
```html
<a href="" data-transition-type="yourtype"></a>
````
```javascript
Transition.types.yourtype = {
    before: function(item, callback) {
        // Do something before loading
        callback(); // Start loading
    },
    after: function(item, callback) {
        // Do something after loading
        callback(); // finish loading
    }
};
```

### Targets
Changes the contents of the target, instead of the whole body
```html
 <a data-transition-target="yourtarget"></a>
 <div data-transition-id="yourtarget"></div>
```

### Keyboard events
Binds keys to items
```html
 <a data-transition-key="27">Close</a>
 <a data-transition-key="37">Previous</a>
 <a data-transition-key="39">Next</a>
```