/*jslint nomen: true, node: true */

var Gun = require('gun/gun');
var initiator = require('./initiator');
var filter = require('./filter');

var younger = (function () {
  'use strict';
  var time = new Date().getTime();
  return function (node) {
    return (node._['>'].id > time);
  };
}());





function greet(peers, myself) {
  'use strict';

  // each peer
  peers.map().val(function (obj) {
    // except myself
    if (obj.id === myself || !younger(obj)) {
      return;
    }

    var client, messages, peer = this;
    messages = Gun.text.random(25);

    // send them a request
    client = initiator(true, function (signal) {
      var SDO = JSON.stringify(signal);
      filter(SDO);
      peer.path([messages, Gun.text.random(25)]).put(SDO);
    });

    // listen for new messages
    window.peer = peer;
    peer.val(function (val) {
      console.log("val:", val);
      if (typeof val === 'object') {
        return;
      }

      var signal = JSON.parse(val);
      console.log('signaling:', signal);
      client.signal(signal);
      return;
//
//      Gun.obj.map(val, function (SDO) {
//        console.log('Obj map:', SDO);
//      });
    });
    peer.path(messages).map().val(function (res, key) {
      console.log('Map thing:', res);
      if (key === 'id' || filter(res)) {
        return console.log('filtering');
      }

      var signal = JSON.parse(res);
      console.log('signaling:', signal);
      client.signal(signal);
    });

  });

}


module.exports = greet;
