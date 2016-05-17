/*jslint node: true*/
var Gun = require('gun/gun');
var Emitter = require('events');

// local data interface
window.local = module.exports = {
	db: new Gun({
		rtc: false
	}),

	ID: Gun.text.random(),
	events: new Emitter()
};
