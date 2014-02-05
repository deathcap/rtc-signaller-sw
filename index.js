// Generated by CoffeeScript 1.7.0
(function() {
  var EventEmitter, Messenger,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  module.exports = function(opts) {
    return new Messenger(opts);
  };

  Messenger = (function(_super) {
    __extends(Messenger, _super);

    function Messenger(opts) {
      var blob, url;
      blob = new Blob(["var ports = []; self.onconnect = function(connectEvent) { var newPort = connectEvent.ports[0]; /* note: always exactly one port */ newPort.postMessage('welcome'); newPort.onmessage = function(messageEvent) { for (var i = 0; i < ports.length; ++i) { var port = ports[i]; if (port !== newPort) /* send to everyone but ourselves */ port.postMessage(messageEvent.data); } } }"], {
        type: 'text/javascript'
      });
      url = URL.createObjectURL(blob);
      console.log(url);
      this.worker = new SharedWorker(url, 'rtc-signaller-sw');
      this.worker.port.addEventListener('message', (function(_this) {
        return function(ev) {
          return _this.emit('data', ev.data);
        };
      })(this));
      this.worker.port.start();
    }

    Messenger.prototype.write = function(data) {
      return this.worker.port.postMessage(data);
    };

    Messenger.prototype.close = function() {};

    return Messenger;

  })(EventEmitter);

}).call(this);
