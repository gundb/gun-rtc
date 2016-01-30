/*jslint nomen: true, node: true */
'use strict';

var handshake = require('../lib/handshake');
var scope = require('../lib/scope');
var peers = require('../lib/peers');
var Gun = require('gun/gun');
peers.myID = Gun.text.random();

Gun.on('opt').event(function (gun, opt) {
	opt = opt || {};
	opt.wire = opt.wire || {};

	var SimplePeer, support, browser;

	SimplePeer = require('simple-peer');
	support = SimplePeer.WEBRTC_SUPPORT;
	browser = typeof window !== 'undefined';

	if (opt.rtc === false || (!support && browser)) {
		return;
	}
	if (!gun.__.opt.peers) {
		return;
	}

	if (!peers.db) {
		peers.db = new Gun({
			peers: gun.__.opt.peers,
			rtc: false
		}).get(scope + 'peers');

		peers.db.path(peers.myID).put({
			id: peers.myID
		});

		handshake(peers.db, peers.myID);
	}

	gun.opt({
		wire: {
			get: opt.wire.get || require('./get'),
			put: opt.wire.get || require('./put')
		}
	}, true);

});

window.gun = new Gun(location + 'gun');

module.exports = Gun;
