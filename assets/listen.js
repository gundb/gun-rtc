/*globals initiator, console, filter */
function listen(peers, myself) {
	'use strict';

	peers.path(myself).map().val(function (val, key) {
		var peer, invalid, res = {},
			signals = [],
			request = this;

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

}
