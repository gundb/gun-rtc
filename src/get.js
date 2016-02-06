/*jslint node: true, nomen: true*/
'use strict';
var Gun = require('gun/gun');
var local = require('./local');
var peers = require('../lib/peers');
var Stream = require('iso-emitter');
var stream = new Stream();

stream.on('request', function (req, peer) {
	local.db.__.opt.wire.get(req.value, function (err, node) {
		if (peer.connected) {
			if (err) {
				return peer.send(err);
			}
			peer.send({
				value: node,
				response: req.ID
			});
		}
	});
});

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

	peers.online.broadcast({
		value: query,
		ID: requestID
	});
};
