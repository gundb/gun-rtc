/*jslint node: true, nomen: true */
'use strict';

var express = require('express');
var Gun = require('gun');
var app = express();
var port = process.argv[2] || 3000;



new Gun({ file: false }).attach(app);


function serve(route) {
	app.use('/', express['static'](__dirname + route));
}

serve('/assets');
serve('/routes');




app.listen(port, function () {
	console.log('Listening on port', port);
});
