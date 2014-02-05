var messenger = require('./')();

messenger.on('data', function(ev) {
  console.log(ev);
});
setInterval(function() {
  messenger.write('hi from '+location.hash);
}, 1000);
