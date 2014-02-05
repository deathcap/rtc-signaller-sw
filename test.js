var messenger = require('./')();

messenger.on('data', function(ev) {
  console.log(ev);
});
messenger.write('hi')
