/*jslint node: true*/
'use strict';
var initiator, view, peers, Gun, SimplePeer;
peers = require('./peers');
Gun = require('gun/gun');
SimplePeer = require('simple-peer');
view = require('./view');



module.exports = function initiator(init, id, signal) {
	var peer = new SimplePeer({
		initiator: init,
		trickle: true
	});
	peer.on('connect', function () {
		view.connection();
		peers.connected[id] = peer;
		window.peers = peers.connected;
	});
	peer.on('signal', signal);
	peer.on('error', view.error);
	peer.on('close', function () {
		view.disconnect();
		peer.destroy();
		delete peers.connected[id];
	});
	peer.on('data', view.data);
	return peer;
};
