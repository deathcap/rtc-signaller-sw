
{EventEmitter} = require('events')

module.exports = (opts) -> new Messenger(opts)

class Messenger extends EventEmitter
  constructor: (opts) ->
    blob = new Blob ["
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

"], {type:'text/javascript'}

    url = URL.createObjectURL blob
    console.log url
    @worker = new SharedWorker url, 'rtc-signaller-sw'

    @worker.port.addEventListener 'message', (ev) =>
      @emit 'data', ev.data

    @worker.port.start()
    # TODO: 'open' event

  write: (data) ->
    @worker.port.postMessage data

  close: () ->
    # TODO

