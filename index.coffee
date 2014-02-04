
{EventEmitter} = require('events')

module.exports = (opts) -> new Messenger(opts)

class Messenger extends EventEmitter
  constructor: (opts) ->
    # TODO: create SharedWorker
    # TODO: 'data', 'open' events

  write: (data) ->
    # TODO @worker.port.postMessage

  close: () ->
    # TODO

