/*jslint node: true*/
var initiator = require('./initiator');
var filter = require('./filter');
var Gun = require('gun/gun');

module.exports = function listen(peers, myself) {
  'use strict';

  // each request object
  peers.path(myself).map().val(function (v, key) {
    var peer, invalid, requests = this;

    if (key === 'id') {
      return;
    }

		function handleSignal(signal) {
      var SDO = JSON.stringify(signal);
      filter(SDO);
      requests.path(Gun.text.random(10)).put(SDO);
    }

    // create a peer instance
    peer = initiator(false, key, handleSignal);

    // each session description object
    requests.map().val(function (SDO, key) {
      if (key === 'id' || filter(SDO)) {
        return;
      }

      var signal = JSON.parse(SDO);
      peer.signal(signal);

    });
  });

};
