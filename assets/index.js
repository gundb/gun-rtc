/*globals console, Gun*/
var peer, queue, gun, id, Peer;

gun = new Gun('http://localhost:3000/gun')
	.get('rtc').set().path('offers');
Peer = window.Peer = window.SimplePeer;
id = Gun.text.random();
queue = [];

(function () {
	'use strict';
	var offer, initiator = !!location.hash;


	peer = new Peer({
		initiator: initiator,
		trickle: false
	});


	function $(s, e) {
		if (!e) {
			return document.querySelector(s);
		} else {
			return {
				run: function (c) {
					s = typeof s === 'string' ? $(s) : s;
					s.addEventListener(e, c);
					return s;
				}
			};
		}
	}


	function format(c) {
		if (typeof c === 'string') {
			return JSON.parse(c);
		} else {
			return JSON.stringify(c);
		}
	}




	$('form', 'submit').run(function (ev) {
		ev.preventDefault();
		var incoming = $('#incoming').value,
			res = format(incoming);

		peer.signal(res);
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
