/*jslint nomen: true */
/*globals Gun, SimplePeer, console */
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



	function greet(peers, myself) {

		// each peer
		peers.map().val(function (obj) {
			// except myself
			if (obj.id === myself || !younger(obj)) {
				console.log('returning');
				return;
			}

			var client, wire, request = {},
				messages = Gun.text.random(),
				peer = this;

			// and a client
			client = new SimplePeer({
				initiator: true,
				trickle: false
			});

			peer = this;

			// listen for responses
			function respond(response) {

				// ignore my own messages
				if (request.sdp === response.sdp) {
					return;
				}
				// send!
				client.signal(response);

			}

			// set display
			client.on('error', view.error)
				.on('close', view.disconnect)
				.on('connect', function () {
					view.connection();
					addPeer(client);
				})
				.on('signal', function (SDO) {
					// generate response
					peer.path(messages).put(request = SDO);
				});

			// respond to each message
			peer.path(messages).map(function () {
				this.back.val(respond);
			});

			return peer;
		});

	}




	function listen(peers, myself) {

		peers.path(myself).map().val(function (val, key) {
			var peer, res = {},
				request = this;

			if (key === 'id') {
				return;
			}

			peer = new SimplePeer({
				initiator: false,
				trickle: false
			}).on('signal', function (SDO) {
				request.put(res = SDO);
			}).on('connect', function () {
				view.connection();
				addPeer(peer);
			});


			request.on().val(function (SDO) {
				if (SDO.sdp === res.sdp) {
					return;
				}
				peer.signal(SDO);
			});
		});

		return peers;

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
		greet(peers, id);

		peers.path(id).put({
			id: id
		});
		listen(peers, id);

	}

}());
