/*jslint node: true, nomen: true */
'use strict';

var express = require('express');
var Gun = require('gun');
var app = express();
var port = process.argv[2] || 3000;



var gun = new Gun({ file: 'examples/data.json' }).wsp(app);
app.use(gun.wsp.server);


function serve(route) {
	app.use('/', express['static'](__dirname + route));
}

serve('/lib');
serve('/examples');
serve('/node_modules/gun/examples');




app.listen(port, function () {
	console.log('Listening on port', port);
});
