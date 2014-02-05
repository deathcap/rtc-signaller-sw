var ports = [];

self.onconnect = function(connectEvent) {
  var newPort = connectEvent.ports[0]; /* note: always exactly one port */

  newPort.postMessage('welcome');

  newPort.onmessage = function(messageEvent) {
    for (var i = 0; i < ports.length; ++i) {
      var port = ports[i];

      if (port !== newPort) /* send to everyone but ourselves */
        port.postMessage(messageEvent.data);
    }
  }
}

