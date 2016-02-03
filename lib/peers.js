/*jslint node: true*/
'use strict';

function PeerCollection() {}
PeerCollection.prototype = {
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
	online: new PeerCollection()
};
