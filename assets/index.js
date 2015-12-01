/*globals console, Gun, SimplePeer */
var peer, queue, gun, id;

gun = new Gun('http://localhost:3000/gun')
	.get('rtc').set().path('offers');


(function () {
	'use strict';
	var offer, initiator = !!location.hash;


	peer = new SimplePeer({
		initiator: initiator,
		trickle: false
	});


	peer
		.on('error', function (err) {
			console.log('error', err);
		})
		.on('connect', function () {
			console.log('Connection established');
			gun.put(null);
		})
		.on('data', function (data) {
			console.log(data);
		})
		.on('signal', function (data) {
			console.log(data.type, 'received');
			gun.set(offer = data);
		})
		.on('close', function () {
			gun.put(null);
		});


	gun.map().val(function (answer) {
		if (offer && offer.sdp === answer.sdp) {
			return;
		}
		peer.signal(answer);
	});

}());
