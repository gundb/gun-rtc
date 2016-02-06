/*jslint nomen: true, node: true */
'use strict';

var handshake = require('../lib/handshake');
var scope = require('../lib/scope');
var peers = require('../lib/peers');
var Gun = require('gun/gun');
var local = require('./local');

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

		peers.db.path(local.ID).put({
			id: local.ID
		});

		// optimization
		// erase peer after leaving
//		if (browser) {
//			window.onunload = function () {
//				peers.db.path(local.ID).put(null);
//			};
//		}

		handshake(peers.db, local.ID);
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
