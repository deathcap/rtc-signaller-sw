'use strict';
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var path = require('path');
var xhr = require('xhr');

var name = 'rtc-signaller-sw';

module.exports = function(opts) {
  return new Messenger(opts);
};

var isValidBlobURL = function(url, cb) {
  xhr({uri: url},
      function(err, resp, body) {
        console.log('XHR',err,resp,body);

        var valid = !!body && body.length !== 0;
        cb(url, valid);
      });
};

window.isValidBlobURL = isValidBlobURL;

function Messenger(opts) {
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
'  //newPort.postMessage("welcome, connection #"+ports.length);',
'});'].join('\n');
  console.log(text);

  var blob = new Blob([text], {type: 'text/javascript'});
  console.log(blob);

  var url = URL.createObjectURL(blob);

  //delete window.localStorage[name];
  //var url = window.localStorage[name];
  isValidBlobURL(url, function(url, isValid) {
    console.log('isValid?',url,isValid);
  });

  if (!url) {
    // save Blob URL across instances since must match
    window.localStorage[name] = url = URL.createObjectURL(blob);
  }
  console.log(url);

  try {
    this.worker = new SharedWorker(url, 'rtc-signaller-sw');
  } catch (e) {
    console.log('FAIL',e);
  }

  var self = this;
  this.worker.port.addEventListener('message', function(ev) {
    self.emit('data', ev.data);
  });

  this.worker.port.start();
  this.emit('open');
}

inherits(Messenger, EventEmitter);

Messenger.prototype.write = function(data) {
  console.log('sending data',data);
  this.worker.port.postMessage(data);
};

Messenger.prototype.close = function() {
  console.log('closing');
  this.worker.port.postMessage(null);
};

