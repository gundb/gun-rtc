/*jslint nomen: true, node: true */

var Gun = require('gun/gun');
var initiator = require('./initiator');
var filter = require('./filter');

var younger = (function () {
  'use strict';
  var time = new Date().getTime();
  return function (node) {
		return (node._['>'].id > time);
  };
}());





function greet(peers, myID) {
  'use strict';

  // each peer
  peers.map().val(function (obj) {
    // except myID
    if (obj.id === myID || !younger(obj)) {
      return;
    }

    var client, peer = this;

		function handleSignal(signal) {
      var obj, SDO = JSON.stringify(signal);
      filter(SDO);
			obj = {};

			// post the session object
			obj[Gun.text.random(10)] = SDO;
      peer.path(myID).put(obj);
		}

    // create a peer and listen for signals
    client = initiator(true, obj.id, handleSignal);

    // listen for new messages
    peer.path(myID).map().val(function (res, key) {

      if (key === 'id' || filter(res)) {
        return;
      }

      var signal = JSON.parse(res);
      client.signal(signal);
    });

  });

}


module.exports = greet;
