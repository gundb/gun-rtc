/*globals Gun, SimplePeer, greet, listen, initiator, view */
/*jslint nomen: true */
var allPeers = [];
(function () {
	'use strict';
	var id, peers, younger, addPeer;

	peers = new Gun('http://localhost:3000/gun').get('peers').set();

	if (SimplePeer.WEBRTC_SUPPORT) {

		view.input.oninput = function () {
			allPeers.forEach(function (peer) {
				peer.send(view.input.value);
			});
		};

		id = Gun.text.random();
		peers.path(id).put({
			id: id
		});

		greet(peers, id);
		listen(peers, id);

	}

}());
