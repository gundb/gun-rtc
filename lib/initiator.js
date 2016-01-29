/*jslint node: true*/
'use strict';
var initiator, view, peers, Gun, SimplePeer;
peers = require('./peers');
Gun = require('gun/gun');
SimplePeer = require('simple-peer');
view = require('./view');



module.exports = function initiator(init, signal, id) {
	var peer = new SimplePeer({
		initiator: init,
		trickle: true
	});
	peer.on('connect', function () {
		view.connection();
    // change to object[id]
		peers.all.push(peer);
	});
	peer.on('signal', signal);
	peer.on('error', view.error);
	peer.on('close', function () {
		view.disconnect();
		peer.destroy();
    // instead, delete obj[id]
		peers.all = peers.all.filter(function (p) {
			return (p !== peer);
		});
	});
	peer.on('data', view.data);
	return peer;
};
