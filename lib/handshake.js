/*jslint node: true*/
'use strict';

var greet = require('./greet');
var listen = require('./listen');

module.exports = function (db, id) {
	greet(db, id);
	listen(db, id);

	return db;
};
