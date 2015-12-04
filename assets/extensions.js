/*globals Gun, SimplePeer, console */
/*jslint nomen: true */
(function () {
	'use strict';
	var view, id, peers, younger, addPeer, allPeers = [];

	younger = (function () {
		var time = new Date().getTime();
		return function (node) {
			return (node._['>'].id > time);
		};
	}());

	function $(query) {
		return document.querySelector(query);
	}


	view = {
		h1: $('h1'),
		input: $('textarea'),

		connection: function () {
			view.h1.style.color = '#00ba00';
			view.h1.innerHTML = 'Connected';
		},

		error: function (e) {
			$('div').innerHTML = e.message || 'No message';
		},

		disconnect: function () {
			view.h1.style.color = '#ba0000';
			view.h1.innerHTML = 'Disconnected';
		},
		data: function (input) {
			view.input.value = input;
		}
	};



	function initiator(init, signal) {
		var peer = new SimplePeer({
			initiator: init,
			trickle: false
		});
		peer.on('connect', function () {
			view.connection();
			addPeer(peer);
		});
		peer.on('signal', signal);
		peer.on('error', view.error);
		peer.on('close', view.disconnect);
		return peer;
	}



	function greet(peers, myself) {

		// each peer
		peers.map().val(function (obj) {

			// except myself
			if (obj.id === myself || !younger(obj)) {
				console.log('returning');
				return;
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
					return console.log('Prevented');
				}
				console.log('Signaling', signal);
				client.signal(signal);
			}

			// respond to each message
			peer.path(messages).map(function (v, key) {
				this.path(key).val(respond);
			});

		});

	}



	function listen(peers, myself) {

		peers.path(myself).map().val(function (val, key) {
			var peer, res = {},
				request = this;

			if (key === 'id') {
				return;
			}

			peer = initiator(false, function (signal) {
				res = signal;
				var SDO = JSON.stringify(signal);
				request.set(SDO);
			});


			request.map(function (v, key) {
				console.log('Message status changed');
				this.path(key).val(function (SDO) {
					var signal = JSON.parse(SDO);
					if (signal.sdp === res.sdp) {
						return console.log('Prevented');
					}
					peer.signal(signal);
				});
			});
		});

	}



	peers = new Gun('http://localhost:3000/gun').get('peers').set();

	if (SimplePeer.WEBRTC_SUPPORT) {

		addPeer = function (peer) {
			peer.on('data', view.data);
			allPeers.push(peer);
		};
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
