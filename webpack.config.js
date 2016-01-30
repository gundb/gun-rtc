/*jslint node: true, nomen: true*/
module.exports = {
	context: __dirname + "/src",
	entry: "./index.js",
	output: {
		path: __dirname,
		filename: "dist/bundle.js"
	}
};
