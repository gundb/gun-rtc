/*jslint node: true, nomen: true*/
'use strict';
var Gun = require('gun/gun');
var peers = require('../lib/peers');
var Stream = require('iso-emitter');
var stream = new Stream();
var gun = new Gun();

stream.on('request', function (obj) {
	var online = peers.connected;
	gun.get(obj.query['#']).on(function (data, key) {
		if (online[obj.peer]) {
			online[obj.peer].send({
				value: data,
				response: obj.request
			});
		}
	});
});

module.exports = function (query, cb, opt) {
	var request = Gun.text.random(20);

	stream.on(request, function (data) {
		if (typeof data === 'string') {
			return cb(data);
		}
		cb(null, data.value);
	});

	peers.connected.broadcast({
		query: query,
		peer: peers.myID,
		request: request
	});
};
