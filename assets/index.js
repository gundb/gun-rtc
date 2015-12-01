/*globals console, Gun, SimplePeer */
var peer, gun, id = Gun.text.random();

gun = new Gun('http://localhost:3000/gun')
	.get('data').set();


(function () {
	'use strict';
	if (SimplePeer.WEBRTC_SUPPORT) {
		gun.path('peers').set();

		peer = new SimplePeer({
			initiator: !!location.hash,
			trickle: false
		});

		gun.path('peers').handshake(peer);
	}

}());
