/*jslint node: true*/
'use strict';
var Gun = require('gun/gun');
var local = require('./local');

module.exports = function (graph, cb, opt) {
	Gun.is.graph(graph, function (node, soul) {
		local.db.put(node, cb).key(soul);
	});
};
