/*jslint node: true*/

/*
	creates peer objects
	and assigns event handlers
	to them.
*/

'use strict';
var peers = require('./peers');
var Gun = require('gun/gun');
var SimplePeer = require('simple-peer');
var view = require('./view');
var local = require('../src/local');
var emitter = local.events;



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
		emitter.emit(data.event, data, peer);
	});

	return peer;
};
