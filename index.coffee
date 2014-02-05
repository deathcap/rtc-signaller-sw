
{EventEmitter} = require('events')

module.exports = (opts) -> new Messenger(opts)

class Messenger extends EventEmitter
  constructor: (opts) ->
    @worker = new SharedWorker 'worker.js', 'rtc-signaller-sw'

    @worker.port.addEventListener 'message', (ev) =>
      @emit 'data', ev.data

    @worker.port.start()
    # TODO: 'open' event

  write: (data) ->
    console.log 'sending data',data
    @worker.port.postMessage data

  close: () ->
    # TODO

