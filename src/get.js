/*jslint node: true, nomen: true*/
'use strict';
var Gun = require('gun/gun');
var local = require('./local');
var peers = require('../lib/peers');
var Stream = require('iso-emitter');
var stream = new Stream();

stream.on('request', function (obj) {
	var online = peers.online;
	local.db.get(obj.query['#'], function (err, node) {
		if (online[obj.peer]) {
			if (err) {
				online[obj.peer].send(err);
			}
			online[obj.peer].send({
				value: node,
				response: obj.request
			});
		}
	});
});

module.exports = function (query, cb, opt) {
	var request = Gun.text.random(20);

	local.db.get(query[Gun._.soul], cb);

	stream.on(request, function (data) {
		if (typeof data === 'string') {
			return cb(data);
		}
		cb(null, data.value);
	});

	peers.online.broadcast({
		query: query,
		peer: local.ID,
		request: request
	});
};
