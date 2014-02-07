'use strict';
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var path = require('path');
var xhr = require('xhr');
var url4data = require('url4data');

var name = 'rtc-signaller-sw';

module.exports = function(opts) {
  return new Messenger(opts);
};

var scriptText = [
'"use strict";',
'var ports = [];',
'',
'self.onconnect = function(connectEvent) {',
'  connectEvent.ports[0].postMessage("init");',
'  var newPort = connectEvent.ports[0]; /* note: always exactly one port */',
'',
'  newPort.onmessage = function(messageEvent) {',
'    newPort.postMessage("echo "+messageEvent.data);',
'    if (messageEvent.data === null) {',
'      ports.splice(ports.indexOf(newPort), 1);',
'      return;',
'    }',
'',
'    newPort.postMessage("replying to "+ports.length+" connections");',
'',
'    for (var i = 0; i < ports.length; ++i) {',
'      var port = ports[i];',
'',
'      if (port !== newPort) /* send to everyone but ourselves */',
'        port.postMessage(messageEvent.data);',
'    }',
'  };',
'',
'  ports.push(newPort);',
'',
'  newPort.postMessage("welcome, connection #"+ports.length);',
'};'].join('\n');

function Messenger(opts) {
  var self = this;
  self.buffered = [];

  url4data(scriptText, name, {type:'text/javascript'}, function(url) {
    console.log(url);

    //self.worker = new SharedWorker(url, 'rtc-signaller-sw'); // not using name since will mismatch URL
    self.worker = new SharedWorker(url);

    window.workers = window.workers || [];
    window.workers.push(self.worker);

    self.worker.port.onerror = self.worker.onerror = function(ev) {
      console.log('[SW] worker error: '+ev);
    };
    self.worker.port.onmessage = function(ev) {
      console.log('[SW] received data ',ev.data);
      self.emit('data', ev.data);
    };

    self.worker.port.start();
    self.worker.port.postMessage('ping');
    self.emit('open');

    // send data write()'d before we were connected TODO: why?
    for (var i = 0; i < self.buffered.length; ++i) {
      console.log('[Sw] sending buffered ',self.buffered[i]);
      self.worker.port.postMessage(self.buffered[i]);
    }
    self.buffered = [];
  });
}

inherits(Messenger, EventEmitter);

Messenger.prototype.write = function(data) {
  console.log('[SW] sending data',data);
  if (!this.worker) {
    console.log('[SW] (buffering)');
    this.buffered.push(data);
  } else {
    this.worker.port.postMessage(data);
  }
};

Messenger.prototype.close = function() {
  console.log('[SW] closing');
  this.worker.port.postMessage(null);
};

