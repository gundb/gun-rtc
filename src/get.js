/*jslint node: true, nomen: true*/
'use strict';
var Gun = require('gun/gun');
var local = require('./local');
var peers = require('../lib/peers');
var emitter = local.events;
var cache = {};

// server
emitter.on('get', function (req, peer) {
	if (!local.db || cache[req.RID]) {
		return;
	}
	cache[req.RID] = true;

	// this won't be necessary in the future!
	local.db.__.opt.wire.get(req.lex, function (err, value) {

		if (!peer.connected) {
			return;
		}

		peer.send({
			event: req.RID,
			value: value,
			err: err
		});
	}, req.opt);
});



// client
module.exports = function (lex, cb, opt) {
	opt = {};
	var requestID = Gun.text.random(20);

	local.db.__.opt.wire.get(lex, cb, opt);

	// when calling `.put`, the raw `.get` driver responds
	// with more data causing it to infinitely recurse.
	// support options for server stuns.
	emitter.on(requestID, function (data) {
		cb(data.err, data.value);
	});

	// be more verbose until we have
	// Gun.is.lex, cuz I'm lazy :P
	peers.online.broadcast({
		RID: requestID,
		event: 'get',
		lex: lex,
		opt: opt
	});
};
