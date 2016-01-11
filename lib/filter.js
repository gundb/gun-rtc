/*jslint node: true*/
'use strict';
module.exports = function filter(signals) {

	return function (signal) {
		var cdd = 'candidate';
		return signals.some(function (res) {
			var seen;
			if (signal.sdp !== undefined) {
				seen = seen || (signal.sdp === res.sdp);
			}
			if (signal[cdd] && res[cdd]) {
				// signal.candidate.candidate
				seen = seen || (signal[cdd][cdd] === res[cdd][cdd]);
			}
			if (signal.type === 'offer') {
				seen = seen || (signal.type === res.type);
			}
			return seen;
		});
	};
};
