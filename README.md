# rtc-signaller-sw

Experimental messenger for [rtc-signaller](https://github.com/rtc-io/rtc-signaller) using [Shared Workers](http://www.w3.org/TR/workers/)

Simplest usage using [rtc-quickconnect](https://github.com/rtc-io/rtc-quickconnect):

    var messenger = require('rtc-signaller-sw')();
    var quickconnect = require('rtc-quickconnect');

    quickconnect(messenger, ...);

Can be used instead of [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard) (e.g., http://rtc.io/switchboard) for local communication.
Shared web workers can be used across **multiple tabs in the same browser instance**, so this module might be useful
for local testing or as a fallback without remote network connectivity.

## Examples

`test.js` - no additional dependencies (no RTC)

`example/demo.js` - uses rtc-quickconnect

To use either example, run `npm start` and load the same URL in two browser tabs,
then view the browser console log to see them communicate.

## License

MIT

