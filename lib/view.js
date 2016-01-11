/*jslint node: true*/
'use strict';
var view;

function $(query) {
	return document.querySelector(query);
}

module.exports = view = {
	h1: $('h1'),
	input: $('input'),

	connection: function () {
		view.h1.style.color = '#00ba00';
		view.h1.innerHTML = 'Connected';
	},

	error: function (e) {
		$('div').innerHTML = e.message || 'No message';
	},

	disconnect: function () {
		view.h1.style.color = '#ba0000';
		view.h1.innerHTML = 'Disconnected';
	},
	data: function (input) {
		view.input.value = input;
	}
};
