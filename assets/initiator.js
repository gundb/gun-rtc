/*globals SimplePeer, allPeers, Gun */
var initiator, view;

(function () {
	'use strict';

	function $(query) {
		return document.querySelector(query);
	}

	view = {
		h1: $('h1'),
		input: $('input'),

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



	initiator = function (init, signal) {
		var peer = new SimplePeer({
			initiator: init,
			trickle: true
		});
		peer.on('connect', function () {
			view.connection();
			allPeers.push(peer);
		});
		peer.on('signal', signal);
		peer.on('error', view.error);
		peer.on('close', view.disconnect);
		peer.on('data', view.data);
		return peer;
	};
}());
