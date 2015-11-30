/*globals console*/
var peer, Peer = window.Peer = window.SimplePeer;
(function () {
	'use strict';

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

	function gen(c) {
		if (typeof c === 'string') {
			return JSON.parse(c);
		} else {
			return JSON.stringify(c);
		}
	}
	
	peer = new Peer({
		initiator: location.hash === '#1',
		trickle: false
	});

	peer.on('error', function (err) {
		console.log('error', err);
	});

	peer.on('signal', function (data) {
		console.log('Signal recieved');
		$('#outgoing').textContent = gen(data);
	});

	$('form', 'submit').run(function (ev) {
		ev.preventDefault();
		var incoming = $('#incoming').value,
			res = gen(incoming);
		
		peer.signal(res);
	});

	peer.on('connect', function () {
		console.log('Connection established');
	});

	peer.on('data', function (data) {
		console.log('data:', data);
	});
}());