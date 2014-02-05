
var messenger = require('../')();
var quickconnect = require('rtc-quickconnect');

// based on example https://github.com/rtc-io/rtc-quickconnect
quickconnect(messenger, {ns: 'dctest'})
  .createDataChannel('test')
  .on('test:open', function(dc, id) {
    dc.onmessage = function(evt) {
      console.log('peer ' + id + ' says: ' + evt.data);
    };

    console.log('test dc open for peer: ' + id);
    dc.send('hi');
  });

