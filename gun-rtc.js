/*jslint node: true */
'use strict';

var Gun = require('gun');
var Peer = require('simple-peer');
require('gun/lib/wsp');
// require('wrtc'); /* Failing!!! */


function setup(gun, opt) {

//	var peer = new Peer({
//		wrtc: wrtc,
//		trickle: false
//	});

	function get(name, cb, options) {
	}

	function put(name, cb, options) {

	}

	function key(name, cb, options) {

	}


	gun.opt({
		hooks: {
//			get: opt.hooks.get || get,
//			put: opt.hooks.put || put,
//			key: opt.hooks.key || key
		}
	}, true);
}

Gun.on('opt').event(setup);

module.exports = Gun;
