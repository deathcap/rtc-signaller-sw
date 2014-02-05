var messenger = require('./')();

messenger.on('data', function(ev) {
  console.log(ev);
});
window.setInterval(function() {
  messenger.write('hi '+Math.random())
}, 1000);
