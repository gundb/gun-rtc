/*globals console, Gun, SimplePeer */
var peer, gun, id = Gun.text.random();

gun = new Gun('http://localhost:3000/gun')
	.get('data').set();


(function () {
	'use strict';
	if (!SimplePeer.WEBRTC_SUPPORT) {
		return;
	}
	var offer, initiator = !!location.hash;
	gun = gun.path('offers').set();
	offer = {};


	peer = new SimplePeer({
		initiator: initiator,
		trickle: false
	});


	peer
		.on('error', console.log)
		.on('connect', function () {
			console.log('Connection established');
			gun.put(null);
		})
		.on('data', console.log)
		.on('signal', function (data) {
			console.log(data.type, 'received');
			offer.sdp = data.sdp;
			gun.set(data);
		})
		.on('close', function () {
			gun.put(null);
		});


	gun.handshake(peer, offer);

}());
