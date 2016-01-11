/*jslint node: true, nomen: true*/
module.exports = {
	context: __dirname + "/lib",
	entry: "./index.js",
	output: {
		path: __dirname,
		filename: "lib/bundle.js"
	}
};
