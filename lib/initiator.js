/*jslint node: true*/
'use strict';
var initiator, view, peers, Gun, SimplePeer;
peers = require('./peers');
Gun = require('gun/gun');
SimplePeer = require('simple-peer');
view = require('./view');
var Stream = require('iso-emitter');



module.exports = function initiator(init, id, signal) {
	var peer = new SimplePeer({
		initiator: init,
		trickle: true
	});
	peer.on('connect', function () {
		view.connection();
		peers.online[id] = peer;
		window.peers = peers;
	});
	peer.on('signal', signal);
	peer.on('error', view.error);
	peer.on('close', function () {
		view.disconnect();
		peer.destroy();
		delete peers.online[id];
	});
	peer.on('data', function (data) {
		var event = 'request';
		if (data.response) {
			event = data.response;
		}
		Stream.emit(event, data);
	});

	return peer;
};
