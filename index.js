'use strict';
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var path = require('path');
var xhr = require('xhr');

var name = 'rtc-signaller-sw';

module.exports = function(opts) {
  return new Messenger(opts);
};

// Blob URLs become invalid once the page is closed
var isValidBlobURL = function(url, cb) {
  if (!url) return cb(url, false);

  xhr({uri: url, sync: true},
      function(err, resp, body) {
        console.log('XHR',err,resp,body);

        var valid = !!body && body.length !== 0;
        cb(url, valid);
      });
};

var createNewBlob = function() {
  var text = [
'var ports = [];',
'',
'self.addEventListener("connect", function(connectEvent) {',
'  var newPort = connectEvent.ports[0]; /* note: always exactly one port */',
'',
'  newPort.onmessage = function(messageEvent) {',
'    if (messageEvent.data === null) {',
'      ports.splice(ports.indexOf(newPort), 1);',
'      return;',
'    };',
'',
//'    newPort.postMessage("replying to "+ports.length+" connections");',
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
//'  newPort.postMessage("welcome, connection #"+ports.length);',
'});'].join('\n');
  //console.log(text);

  var blob = new Blob([text], {type: 'text/javascript'});
  var url = URL.createObjectURL(blob);
  // save Blob URL across instances since must match for shared workers
  window.localStorage[name] = url = URL.createObjectURL(blob);
  console.log('Created new Blob URL',url);

  return url;
};


function Messenger(opts) {
  var url = window.localStorage[name];
  var self = this;
  self.buffered = [];
  isValidBlobURL(url, function(url, isValid) {
    if (!isValid) {
      url = createNewBlob();
    } else {
      console.log('Using existing valid Blob URL',url);
    }

    console.log(url);

    try {
      //self.worker = new SharedWorker(url, 'rtc-signaller-sw'); // not using name since will mismatch URL
      self.worker = new SharedWorker(url);
    } catch (e) {
      console.log('FAIL',e);
    }

    self.worker.port.addEventListener('message', function(ev) {
      console.log('[SW] received data ',ev.data);
      self.emit('data', ev.data);
    });

    self.worker.port.start();
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

