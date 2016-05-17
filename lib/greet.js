/*jslint nomen: true, node: true */

var Gun = require('gun/gun');
var initiator = require('./initiator');
var filter = require('./filter');
var online = require('./peers').online;

var younger = (function () {
  'use strict';
  var time = new Date().getTime();
  return function (node) {
		return (Gun.is.node.state(node, 'id') > time);
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
		if (online[obj.id]) {
			return;
		}

    var client, peer = this;

		function handleSignal(signal) {
      var obj, SDO = JSON.stringify(signal);
			obj = {};

      filter(SDO);

			// post the session object
			obj[Gun.text.random(10)] = SDO;
      peer.path(myID).put(obj);
		}

    // create a peer and listen for signals
    client = initiator(true, obj.id, handleSignal);

    // listen for new messages
    peer.path(myID).map().val(function (res, key) {
			if (typeof res === 'object') {
				return;
			}

      if (key === 'id' || filter(res)) {
        return;
      }

      var signal = JSON.parse(res);

			// connection failed. Don't join.
			if (!client.destroyed) {
				client.signal(signal);
			}
    });

  });

}


module.exports = greet;
