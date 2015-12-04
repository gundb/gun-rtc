/*globals initiator, Gun, console */
/*jslint nomen: true */



var younger = (function () {
	'use strict';
	var time = new Date().getTime();
	return function (node) {
		return (node._['>'].id > time);
	};
}());





function greet(peers, myself) {
	'use strict';

	// each peer
	peers.map().val(function (obj) {

		// except myself
		if (obj.id === myself || !younger(obj)) {
			return console.log('returning');
		}

		var client, request = {},
			messages = Gun.text.random(),
			peer = this;

		client = initiator(true, function (signal) {
			request = signal;
			var SDO = JSON.stringify(signal);
			peer.path(messages).set(SDO);
		});

		// listen for responses
		function respond(response) {

			// ignore my own messages
			var signal = JSON.parse(response);
			if (request.sdp === signal.sdp) {
				return;
			}
			client.signal(signal);
		}

		// respond to each message
		peer.path(messages).map(function (v, key) {
			this.path(key).val(respond);
		});

	});

}
