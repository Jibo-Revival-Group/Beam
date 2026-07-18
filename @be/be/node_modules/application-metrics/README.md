# Metrics Timer

Simple timer for use in application metrics

## Example Usage

```javascript
var timer = require('metrics-timer');
var myEvent = require('foo');

myEvent.on('connect', function(id) {

    timer.start(id);
});

myEvent.on('disconnect', function(id) {

    var eventTime = timer.stop(id);

    // outputs milliseconds
    console.log(eventTime);
});
```


