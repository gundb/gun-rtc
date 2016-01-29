/*jslint node: true*/
'use strict';
var seen = {};

module.exports = function filter(signal) {
  if (seen[signal]) {
    return true;
  }
  seen[signal] = true;
  return false;
};
