/*jslint node: true, nomen: true*/
'use strict';
var Gun = require('gun/gun');
var local = require('./local');
var peers = require('../lib/peers');
var Stream = require('iso-emitter');
var stream = new Stream();

stream.on('put', function (req, peer) {

	// this won't be necessary in the future!
	local.db.__.opt.wire.put(req.value, function (err, node) {
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

module.exports = function (graph, cb, opt) {
	var requestID = Gun.text.random();
	
	// this shall not be needed in future things
	local.db.__.opt.wire.put(graph, cb, opt);

	stream.on(requestID, function (data) {
		if (data && data.err) {
			return cb(data);
		}
		cb(null, data);
	});

	peers.online.broadcast({
		type: 'put',
		value: graph,
		ID: requestID
	});
};