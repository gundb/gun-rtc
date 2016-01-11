/*jslint node: true*/
var initiator = require('./initiator');
var filter = require('./filter');

module.exports = function listen(peers, myself) {
	'use strict';

	peers.path(myself).map().val(function (v, key) {
		var peer, invalid, signals, request = this;
		signals = [];

		if (key === 'id') {
			return;
		}

		peer = initiator(false, function (signal) {
			signals.push(signal);
			var SDO = JSON.stringify(signal);
			request.set(SDO);
		});

		invalid = filter(signals);

		request.map(function (v, key) {
			this.path(key).val(function (SDO) {

				var signal = JSON.parse(SDO);
				if (invalid(signal)) {
					return;
				}
				signals.push(signal);
				peer.signal(signal);

			});
		});
	});

};
