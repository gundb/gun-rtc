/*globals Gun, console */



(function () {
	'use strict';

	function $(s) {
		return document.querySelector(s);
	}

	var view = {
		h1: $('h1'), input: $('textarea'),
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


	console.log = (function () {
		var log = console.log;
		return function () {
			log.apply(console, arguments);
		};
	}());



	Gun.chain.cp = function (obj, cb) {
		if (!obj) return this;

		return this.map().val(function (val, key) {
			obj.push ? obj.push(val) : obj[key] = val;

			if (cb) cb(val);
		}).back;
	};



	Gun.chain.handshake = function (peer) {
		var gun = this, wire = {
			offer: {},
			sync: function () {
				view.input.oninput = function () {
					peer.send(view.input.value);
				};
			},
			send: function (data) {
				gun.set(wire.offer = data);
			},
			respond: function (answer) {
				if (wire.offer.sdp !== answer.sdp) {
					peer.signal(answer);
				}
			}
		};

		peer
			.on('connect', gun.put.bind(gun, null))
			.on('close', gun.put.bind(gun, null))
			.on('connect', view.connection)
			.on('close', view.disconnect)
			.on('connect', wire.sync)
			.on('signal', wire.send)
			.on('error', view.error)
			.on('data', view.data);


		return gun.map().val(wire.respond).back;
	};
}());
