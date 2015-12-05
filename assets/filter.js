function filter(signals) {
	'use strict';

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
			return seen;
		});
	};
}
