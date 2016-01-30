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
	},

	broadcast: function (msg) {
		return this.each(function (peer) {
			peer.send(msg);
		});
	}
};

module.exports = {
	connected: new PeerObject(),
	myID: null,
	db: null
};
