/*jslint nomen: true, node: true */
'use strict';
var id, peers, view, SimplePeer, peers, Gun, greet, listen;
SimplePeer = require('simple-peer');

if (SimplePeer.WEBRTC_SUPPORT) {
	view = require('./view');
	peers = require('./peers');
	Gun = require('gun/gun');
	greet = require('./greet');
	listen = require('./listen');
	localStorage.clear();

	peers.db = new Gun(location + 'gun').get('peers');

	view.input.oninput = function () {
		peers.all.forEach(function (peer) {
			peer.send(view.input.value);
		});
	};

	id = Gun.text.random();
	peers.db.path(id).put({
		id: id
	});
	window.gun = peers.db;

	greet(peers.db, id);
	listen(peers.db, id);

}

module.exports = Gun;
