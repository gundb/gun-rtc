/*jslint nomen: true, node: true */
'use strict';

var handshake = require('../lib/handshake');
var peers = require('../lib/peers');
var SimplePeer = require('simple-peer');
var Gun = require('gun/gun');
var local = require('./local');
Gun.time.now = function () {
	return new Date().getTime();
};

Gun.on('opt').event(function (gun, opt) {
	opt = opt || {};
	var support, browser, wire, rtc = opt.rtc;
	support = SimplePeer.WEBRTC_SUPPORT;
	browser = typeof window !== 'undefined';
	
	if (rtc === false || (!support && browser)) {
		return;
	}

	if (!peers.db) {

		peers.db = new Gun({
			peers: gun.__.opt.peers,
			rtc: false
		}).get({
			'#': 'GUN_RTC_PEERS_SETUP',
			'>': {
				'>': new Date().getTime()
			}
		});

		peers.db.path(local.ID).put({
			id: local.ID
		});

		handshake(peers.db, local.ID);
	}

	wire = opt.wire || {};
	gun.opt({
		wire: {
			get: wire.get || require('./get'),
			put: wire.put || require('./put')
		}
	}, true);

});

window.gun = new Gun(location + 'gun');

module.exports = Gun;
