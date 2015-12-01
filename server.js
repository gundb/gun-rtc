/*jslint node: true, nomen: true */
'use strict';
var Gun, app, express, port;


express = require('express');
Gun = require('gun');
app = express();
port = process.argv[2] || 3000;

new Gun({
	file: false
}).attach(app);


function serve(route) {
	app.use('/', express['static'](__dirname + '/' + route));
}

serve('assets');
serve('routes');




app.listen(port, function () {
	console.log('Listening on port', port);
});
