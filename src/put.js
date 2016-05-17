/*jslint node: true, nomen: true*/
'use strict';
var Gun = require('gun/gun');
var local = require('./local');
var peers = require('../lib/peers');
var events = local.events;
var cache = {};

// server
events.on('put', function (req, peer) {
	if (cache[req.RID]) {
		return;
	}
	cache[req.RID] = true;

	// this won't be necessary in the future!
	local.db.__.opt.wire.put(req.graph, function (err, node) {
		if (!peer.connected) {
			return;
		}
		peer.send({
			event: req.RID,
			err: err,
			value: node
		});
	}, req.opt);
});

// client
module.exports = function (graph, cb, opt) {
	opt = {};
	var requestID = Gun.text.random(20);

//	Gun.is.graph(graph, function (node, soul) {
//		var graph = local.db.__.graph;
//		if (!graph[soul]) {
//			graph[soul] = node;
//		}
//	});
//	local.db.__.opt.wire.put(graph, cb, opt);
	
	Gun.is.graph(graph, function (node, soul) {
		local.db.put(node).key(soul);
	});

	events.on(requestID, function (data) {
		cb(data.err, data.value);
	});

	peers.online.broadcast({
		RID: requestID,
		event: 'put',
		graph: graph,
		opt: opt
	});
};
