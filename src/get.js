/*jslint node: true, nomen: true*/
'use strict';
var Gun = require('gun/gun');
var local = require('./local');
var peers = require('../lib/peers');
var Stream = require('iso-emitter');
var stream = new Stream();



// server
stream.on('get', function (req, peer) {

	// this won't be necessary in the future!
	local.db.__.opt.wire.get(req.value, function (err, node) {

		if (peer.connected) {
			if (err) {
				return peer.send({
					err: err.err,
					response: req.ID
				});
			}

			peer.send({
				value: node,
				response: req.ID
			});
		}
	});
});



// client
module.exports = function (query, cb, opt) {
	var requestID = Gun.text.random(20);

	local.db.__.opt.wire.get(query, cb, opt);

	stream.on(requestID, function (data) {
		if (data.err) {
			return cb(data.err);
		}
		cb(null, data.value);

		// when calling `.put`, the raw `.get` driver responds
		// with more data causing it to infinitely recurse.
		// support options for server stuns.
	});

	// be more verbose until we have
	// Gun.is.lex, cuz I'm lazy :P
	peers.online.broadcast({
		type: 'get',
		value: query,
		ID: requestID
	});
};