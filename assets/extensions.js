/*globals Gun, console */

console.log = (function () {
	'use strict';
	var log = console.log;
	return function () {
		log.apply(console, arguments);
	};
}());


Gun.chain.cp = function (target, cb) {
	'use strict';
	var gun = this;
	if (!target) {
		return gun;
	}
	this.map().val(function (val, key) {
		if (target.constructor === Array) {
			target.push(val);
		} else {
			target[key] = val;
		}
		if (cb) {
			cb(val);
		}
	});
	return gun;
};

Gun.chain.handshake = function (peer, own) {
	'use strict';
	this.map().val(function (answer) {
		// don't answer your own signal
		if (own.sdp !== answer.sdp) {
			peer.signal(answer);
		}
	});

	return this;
};
