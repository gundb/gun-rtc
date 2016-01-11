/*jslint nomen: true, node: true */
'use strict';
var view = require('./view');
var SimplePeer = require('simple-peer');
var peers = require('./peers');
var Gun = require('gun/gun');
var greet = require('./greet');
var listen = require('./listen');
var id, peers;

if (SimplePeer.WEBRTC_SUPPORT) {
	peers.db = new Gun(location + 'gun').get('peers').set();

	view.input.oninput = function () {
		peers.all.forEach(function (peer) {
			peer.send(view.input.value);
		});
	};

	id = Gun.text.random();
	peers.db.path(id).put({
		id: id
	});

	greet(peers.db, id);
	listen(peers.db, id);

}

module.exports = Gun;
