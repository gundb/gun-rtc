/*globals initiator, console */
function listen(peers, myself) {
	'use strict';

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
			this.path(key).val(function (SDO) {
				var signal = JSON.parse(SDO);
				if (signal.sdp === res.sdp) {
					return;
				}
				peer.signal(signal);
			});
		});
	});

}
