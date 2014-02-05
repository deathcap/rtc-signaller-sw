var ports = [];

self.addEventListener('connect', function(connectEvent) {
  var newPort = connectEvent.ports[0]; /* note: always exactly one port */

  newPort.onmessage = function(messageEvent) {
    if (messageEvent.data === null) {
      ports.splice(ports.indexOf(newPort), 1);
      return;
    };

    newPort.postMessage('replying to '+ports.length+' connections');

    for (var i = 0; i < ports.length; ++i) {
      var port = ports[i];

      if (port !== newPort) /* send to everyone but ourselves */
        port.postMessage(messageEvent.data);
    }
  };

  ports.push(newPort);

  //newPort.postMessage('welcome, connection #'+ports.length);
});
