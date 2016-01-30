/*jslint node: true*/
'use strict';

function PeerObject() {}
PeerObject.prototype = {
	each: function (cb) {
		var peer;
		for (peer in this) {
			if (this.hasOwnProperty(peer)) {
				cb(this[peer], peer, this);
			}
		}
		return this;
	}
};

module.exports = {
	connected: new PeerObject(),
	db: null
};
