'use strict';
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var path = require('path');

var name = 'rtc-signaller-sw';

module.exports = function(opts) {
  return new Messenger(opts);
};

var isValidBlobURL = function(url, cb) {
  var fr = new FileReader(url);
  fr.onloadend = function() {
    var valid = fr.result && fr.result.length !== 0;
    cb(url, valid);
  };

  fr.onerror = function() {
    cb(url, false);
  }
};

function Messenger(opts) {
  var text = require('./worker.js');
  console.log(text);

  var blob = new Blob([text], {type: 'text/javascript'});

  var url = window.localStorage[name];
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

