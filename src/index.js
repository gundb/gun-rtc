/*jslint nomen: true, node: true */
'use strict';

var handshake = require('../lib/handshake');
var scope = require('../lib/scope');
var peers = require('../lib/peers');
var Gun = require('gun/gun');

var id = Gun.text.random();

Gun.on('opt').event(function (gun) {
	var SimplePeer, support, browser;

	SimplePeer = require('simple-peer');
	support = SimplePeer.WEBRTC_SUPPORT;
	browser = typeof window !== 'undefined';

	if (!support && browser) {
		return;
	}

	peers.db = gun.get(scope + 'peers');
	peers.db.path(id).put({
		id: id
	});

	handshake(peers.db, id);
});

var gun = new Gun(location + '/gun');

module.exports = Gun;
