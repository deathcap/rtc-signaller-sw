'use strict';

var messenger = require('./')();

messenger.on('data', function(ev) {
  console.log(ev);
});
var count = 0;
var interval = setInterval(function() {
  messenger.write('hi from '+location.hash);
  ++count;
  if (count > +location.hash.substr(1)) {
    messenger.close();
    clearInterval(interval);
  }
}, 1000);
