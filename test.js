'use strict';

var messenger = require('./')();

var id = 'instance-'+Math.random(); // for example only
console.log('We are '+id);

messenger.on('data', function(ev) {
  console.log(ev);
});
var count = 0;
var interval = setInterval(function() {
  messenger.write('hi from '+id);
  /* test close()
  ++count;
  if (count > +location.hash.substr(1)) {
    messenger.close();
    clearInterval(interval);
  }
  */
}, 1000);
