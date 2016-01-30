/*jslint node: true, nomen: true */
'use strict';

var express = require('express');
var Gun = require('gun');
var app = express();
var port = process.argv[2] || 3000;


var gun = new Gun({
	file: 'peers.json'
}).wsp(app);

function serve(route) {
	app.use('/', express['static'](__dirname + route));
}

serve('/');
serve('/lib');
serve('/dist');

app.listen(port, function () {
	console.log('Listening on port', port);
});
