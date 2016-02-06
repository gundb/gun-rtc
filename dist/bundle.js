/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint nomen: true, node: true */
	'use strict';

	var handshake = __webpack_require__(1);
	var scope = __webpack_require__(43);
	var peers = __webpack_require__(5);
	var Gun = __webpack_require__(3);
	var local = __webpack_require__(44);

	Gun.on('opt').event(function (gun, opt) {
		opt = opt || {};
		opt.wire = opt.wire || {};

		var SimplePeer, support, browser;

		SimplePeer = __webpack_require__(6);
		support = SimplePeer.WEBRTC_SUPPORT;
		browser = typeof window !== 'undefined';

		if (opt.rtc === false || (!support && browser)) {
			return;
		}
		if (!gun.__.opt.peers) {
			return;
		}

		if (!peers.db) {

			peers.db = new Gun({
				peers: gun.__.opt.peers,
				rtc: false
			}).get(scope + 'peers');

			peers.db.path(local.ID).put({
				id: local.ID
			});

			// optimization
			// erase peer after leaving
	//		if (browser) {
	//			window.onunload = function () {
	//				peers.db.path(local.ID).put(null);
	//			};
	//		}

			handshake(peers.db, local.ID);
		}

		gun.opt({
			wire: {
				get: opt.wire.get || __webpack_require__(45),
				put: opt.wire.get || __webpack_require__(46)
			}
		}, true);

	});

	window.gun = new Gun(location + 'gun');

	module.exports = Gun;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/
	'use strict';

	var greet = __webpack_require__(2);
	var listen = __webpack_require__(42);

	module.exports = function (db, id) {
		greet(db, id);
		listen(db, id);

		return db;
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint nomen: true, node: true */

	var Gun = __webpack_require__(3);
	var initiator = __webpack_require__(4);
	var filter = __webpack_require__(41);

	var younger = (function () {
	  'use strict';
	  var time = new Date().getTime();
	  return function (node) {
			return (node._['>'].id > time);
	  };
	}());





	function greet(peers, myID) {
	  'use strict';

	  // each peer
	  peers.map().val(function (obj) {
	    // except myID
	    if (obj.id === myID || !younger(obj)) {
	      return;
	    }

	    var client, peer = this;

			function handleSignal(signal) {
	      var obj, SDO = JSON.stringify(signal);
				obj = {};

	      filter(SDO);

				// post the session object
				obj[Gun.text.random(10)] = SDO;
	      peer.path(myID).put(obj);
			}

	    // create a peer and listen for signals
	    client = initiator(true, obj.id, handleSignal);

	    // listen for new messages
	    peer.path(myID).map().val(function (res, key) {
				if (typeof res === 'object') {
					return;
				}

	      if (key === 'id' || filter(res)) {
	        return;
	      }

	      var signal = JSON.parse(res);

				// connection failed. Don't join.
				if (!client.destroyed) {
					client.signal(signal);
				}
	    });

	  });

	}


	module.exports = greet;


/***/ },
/* 3 */
/***/ function(module, exports) {

	;(function(){

		function Gun(o){
			var gun = this;
			if(!Gun.is(gun)){ return new Gun(o) }
			if(Gun.is(o)){ return gun }
			return gun.opt(o);
		}

		;(function(Util){ // Generic javascript utilities.
			;(function(Type){
				Type.fns = {is: function(fn){ return (fn instanceof Function)? true : false }};
				Type.bi = {is: function(b){ return (b instanceof Boolean || typeof b == 'boolean')? true : false }}
				Type.num = {is: function(n){ return !Type.list.is(n) && (Infinity === n || n - parseFloat(n) + 1 >= 0) }}
				Type.text = {is: function(t){ return typeof t == 'string'? true : false }}
				Type.text.ify = function(t){
					if(Type.text.is(t)){ return t }
					if(typeof JSON !== "undefined"){ return JSON.stringify(t) }
					return (t && t.toString)? t.toString() : t;
				}
				Type.text.random = function(l, c){
					var s = '';
					l = l || 24; // you are not going to make a 0 length random number, so no need to check type
					c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
					while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
					return s;
				}
				Type.text.match = function(t, o){ var r = false;
					t = t || '';
					o = o || {}; // {'~', '=', '*', '<', '>', '+', '-', '?', '!'} // ignore uppercase, exactly equal, anything after, lexically larger, lexically lesser, added in, subtacted from, questionable fuzzy match, and ends with.
					if(Type.obj.has(o,'~')){ t = t.toLowerCase() }
					if(Type.obj.has(o,'=')){ return t === o['='] }
					if(Type.obj.has(o,'*')){ if(t.slice(0, o['*'].length) === o['*']){ r = true; t = t.slice(o['*'].length) } else { return false }}
					if(Type.obj.has(o,'!')){ if(t.slice(-o['!'].length) === o['!']){ r = true } else { return false }}
					if(Type.obj.has(o,'+')){
						if(Type.list.map(Type.list.is(o['+'])? o['+'] : [o['+']], function(m){
							if(t.indexOf(m) >= 0){ r = true } else { return true }
						})){ return false }
					}
					if(Type.obj.has(o,'-')){
						if(Type.list.map(Type.list.is(o['-'])? o['-'] : [o['-']], function(m){
							if(t.indexOf(m) < 0){ r = true } else { return true }
						})){ return false }
					}
					if(Type.obj.has(o,'>')){ if(t > o['>']){ r = true } else { return false }}
					if(Type.obj.has(o,'<')){ if(t < o['<']){ r = true } else { return false }}
					function fuzzy(t,f){ var n = -1, i = 0, c; for(;c = f[i++];){ if(!~(n = t.indexOf(c, n+1))){ return false }} return true } // via http://stackoverflow.com/questions/9206013/javascript-fuzzy-search
					if(Type.obj.has(o,'?')){ if(fuzzy(t, o['?'])){ r = true } else { return false }} // change name!
					return r;
				}
				Type.list = {is: function(l){ return (l instanceof Array)? true : false }}
				Type.list.slit = Array.prototype.slice;
				Type.list.sort = function(k){ // creates a new sort function based off some field
					return function(A,B){
						if(!A || !B){ return 0 } A = A[k]; B = B[k];
						if(A < B){ return -1 }else if(A > B){ return 1 }
						else { return 0 }
					}
				}
				Type.list.map = function(l, c, _){ return Type.obj.map(l, c, _) }
				Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
				Type.obj = {is: function(o) { return !o || !o.constructor? false : o.constructor === Object? true : !o.constructor.call || o.constructor.toString().match(/\[native\ code\]/)? false : true }}
				Type.obj.put = function(o, f, v){ return (o||{})[f] = v, o }
				Type.obj.del = function(o, k){
					if(!o){ return }
					o[k] = null;
					delete o[k];
					return true;
				}
				Type.obj.ify = function(o){
					if(Type.obj.is(o)){ return o }
					try{o = JSON.parse(o);
					}catch(e){o={}};
					return o;
				}
				Type.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
					return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
				}
				Type.obj.as = function(b, f, d){ return b[f] = b[f] || (arguments.length >= 3? d : {}) }
				Type.obj.has = function(o, t){ return o && Object.prototype.hasOwnProperty.call(o, t) }
				Type.obj.empty = function(o, n){
					if(!o){ return true }
					return Type.obj.map(o,function(v,i){
						if(n && (i === n || (Type.obj.is(n) && Type.obj.has(n, i)))){ return }
						if(i){ return true }
					})? false : true;
				}
				Type.obj.map = function(l, c, _){
					var u, i = 0, ii = 0, x, r, rr, ll, lle, f = Type.fns.is(c),
					t = function(k,v){
						if(2 === arguments.length){
							rr = rr || {};
							rr[k] = v;
							return;
						} rr = rr || [];
						rr.push(k);
					};
					if(Object.keys && Type.obj.is(l)){
						ll = Object.keys(l); lle = true;
					}
					if(Type.list.is(l) || ll){
						x = (ll || l).length;
						for(;i < x; i++){
							ii = (i + Type.list.index);
							if(f){
								r = lle? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
								if(r !== u){ return r }
							} else {
								//if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
								if(c === l[lle? ll[i] : i]){ return ll? ll[i] : ii } // use this for now
							}
						}
					} else {
						for(i in l){
							if(f){
								if(Type.obj.has(l,i)){
									r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
									if(r !== u){ return r }
								}
							} else {
								//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
								if(c === l[i]){ return i } // use this for now
							}
						}
					}
					return f? rr : Type.list.index? 0 : -1;
				}
				Type.time = {};
				Type.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) }
				Type.time.now = function(t){
					return ((t=t||Type.time.is()) > (Type.time.now.last || -Infinity)? (Type.time.now.last = t) : Type.time.now(t + 1)) + (Type.time.now.drift || 0); // TODO: BUG? Should this go on the inside?
				};
			}(Util));
			;(function(exports){ // On event emitter generic javascript utility.
				function On(){};
				On.create = function(){
					var on = function(e){
						on.event.e = e;
						on.event.s[e] = on.event.s[e] || [];
						return on;
					};
					on.emit = function(a){
						var e = on.event.e, s = on.event.s[e], args = arguments, l = args.length;
						exports.list.map(s, function(hear, i){
							if(!hear.fn){ s.splice(i-1, 0); return; }
							if(1 === l){ hear.fn(a); return; }
							hear.fn.apply(hear, args);
						});
						if(!s.length){ delete on.event.s[e] }
					}
					on.event = function(fn, i){
						var s = on.event.s[on.event.e]; if(!s){ return }
						var e = {fn: fn, i: i || 0, off: function(){ return !(e.fn = false) }};
						return s.push(e), i? s.sort(sort) : i, e;
					}
					on.event.s = {};
					return on;
				}
				var sort = exports.list.sort('i');
				exports.on = On.create();
				exports.on.create = On.create;
			}(Util));
			;(function(exports){ // Generic javascript scheduler utility.
				var schedule = function(state, cb){ // maybe use lru-cache?
					schedule.waiting.push({when: state, event: cb || function(){}});
					if(schedule.soonest < state){ return }
					schedule.set(state);
				}
				schedule.waiting = [];
				schedule.soonest = Infinity;
				schedule.sort = exports.list.sort('when');
				schedule.set = function(future){
					if(Infinity <= (schedule.soonest = future)){ return }
					var now = exports.time.now(); // WAS time.is() TODO: Hmmm, this would make it hard for every gun instance to have their own version of time.
					future = (future <= now)? 0 : (future - now);
					clearTimeout(schedule.id);
					schedule.id = setTimeout(schedule.check, future);
				}
				schedule.check = function(){
					var now = exports.time.now(), soonest = Infinity; // WAS time.is() TODO: Same as above about time. Hmmm.
					schedule.waiting.sort(schedule.sort);
					schedule.waiting = exports.list.map(schedule.waiting, function(wait, i, map){
						if(!wait){ return }
						if(wait.when <= now){
							if(exports.fns.is(wait.event)){
								setTimeout(function(){ wait.event() },0);
							}
						} else {
							soonest = (soonest < wait.when)? soonest : wait.when;
							map(wait);
						}
					}) || [];
					schedule.set(soonest);
				}
				exports.schedule = schedule;
			}(Util));
		}(Gun));

		;(function(Gun){ // Gun specific utilities.

			Gun.version = 0.3;

			Gun._ = { // some reserved key words, these are not the only ones.
				meta: '_' // all metadata of the node is stored in the meta property on the node.
				,soul: '#' // a soul is a UUID of a node but it always points to the "latest" data known.
				,field: '.' // a field is a property on a node which points to a value.
				,state: '>' // other than the soul, we store HAM metadata.
			}

			Gun.is = function(gun){ return (gun instanceof Gun)? true : false } // check to see if it is a GUN instance.

			Gun.is.val = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
				if(v === null){ return true } // "deletes", nulling out fields.
				if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
				if(Gun.bi.is(v) // by "binary" we mean boolean.
				|| Gun.num.is(v)
				|| Gun.text.is(v)){ // by "text" we mean strings.
					return true; // simple values are valid.
				}
				return Gun.is.rel(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
			}

			Gun.is.rel = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
				if(Gun.obj.is(v)){ // must be an object.
					var id;
					Gun.obj.map(v, function(s, f){ // map over the object...
						if(id){ return id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
						if(f == Gun._.soul && Gun.text.is(s)){ // the field should be '#' and have a text value.
							id = s; // we found the soul!
						} else {
							return id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
						}
					});
					if(id){ // a valid id was found.
						return id; // yay! Return it.
					}
				}
				return false; // the value was not a valid soul relation.
			}

			Gun.is.rel.ify = function(s){ var r = {}; return Gun.obj.put(r, Gun._.soul, s), r } // convert a soul into a relation and return it.

			Gun.is.node = function(n, cb, t){ var s; // checks to see if an object is a valid node.
				if(!Gun.obj.is(n)){ return false } // must be an object.
				if(s = Gun.is.node.soul(n)){ // must have a soul on it.
					return !Gun.obj.map(n, function(v, f){ // we invert this because the way we check for this is via a negation.
						if(f == Gun._.meta){ return } // skip over the metadata.
						if(!Gun.is.val(v)){ return true } // it is true that this is an invalid node.
						if(cb){ cb.call(t, v, f, n) } // optionally callback each field/value.
					});
				}
				return false; // nope! This was not a valid node.
			}

			Gun.is.node.ify = function(n, s, o){ // convert a shallow object into a node.
				o = Gun.bi.is(o)? {force: o} : o || {}; // detect options.
				n = Gun.is.node.soul.ify(n, s, o.force); // put a soul on it.
				Gun.obj.map(n, function(v, f){ // iterate over each field/value.
					if(Gun._.meta === f){ return } // ignore meta.
					Gun.is.node.state.ify([n], f, v, o.state = o.state || Gun.time.now()); // and set the state for this field and value on this node.
				});
				return n; // This will only be a valid node if the object wasn't already deep!
			}

			Gun.is.node.soul = function(n, s){ return (n && n._ && n._[s || Gun._.soul]) || false } // convenience function to check to see if there is a soul on a node and return it.

			Gun.is.node.soul.ify = function(n, s, o){ // put a soul on an object.
				n = n || {}; // make sure it exists.
				n._ = n._ || {}; // make sure meta exists.
				n._[Gun._.soul] = o? s : n._[Gun._.soul] || s || Gun.text.random(); // if it already has a soul then use that instead - unless you force the soul you want with an option.
				return n;
			}

			Gun.is.node.state = function(n, f){ return (f && n && n._ && n._[Gun._.state] && Gun.num.is(n._[Gun._.state][f]))? n._[Gun._.state][f] : false } // convenience function to get the state on a field on a node and return it.

			Gun.is.node.state.ify = function(l, f, v, state){ // put a field's state and value on some nodes.
				l = Gun.list.is(l)? l : [l]; // handle a list of nodes or just one node.
				var l = l.reverse(), d = l[0]; // we might want to inherit the state from the last node in the list.
				Gun.list.map(l, function(n, i){ // iterate over each node.
					n = n || {}; // make sure it exists.
					if(Gun.is.val(v)){ n[f] = v } // if we have a value, then put it.
					n._ = n._ || {}; // make sure meta exists.
					n = n._[Gun._.state] = n._[Gun._.state] || {}; // make sure HAM state exists.
					if(i = d._[Gun._.state][f]){ n[f] = i } // inherit the state!
					if(Gun.num.is(state)){ n[f] = state } // or manually set the state.
				});
			}

			Gun.is.graph = function(g, cb, fn, t){ // checks to see if an object is a valid graph.
				var exist = false;
				if(!Gun.obj.is(g)){ return false } // must be an object.
				return !Gun.obj.map(g, function(n, s){ // we invert this because the way we check for this is via a negation.
					if(!n || s !== Gun.is.node.soul(n) || !Gun.is.node(n, fn)){ return true } // it is true that this is an invalid graph.
					(cb || function(){}).call(t, n, s, function(fn){ // optional callback for each node.
						if(fn){ Gun.is.node(n, fn, t) } // where we then have an optional callback for each field/value.
					});
					exist = true;
				}) && exist; // makes sure it wasn't an empty object.
			}

			Gun.is.graph.ify = function(n){ var s; // wrap a node into a graph.
				if(s = Gun.is.node.soul(n)){ // grab the soul from the node, if it is a node.
					return Gun.obj.put({}, s, n); // then create and return a graph which has a node on the matching soul property.
				}
			}


			Gun.HAM = function(machineState, incomingState, currentState, incomingValue, currentValue){ // TODO: Lester's comments on roll backs could be vulnerable to divergence, investigate!
				if(machineState < incomingState){
					// the incoming value is outside the boundary of the machine's state, it must be reprocessed in another state.
					return {defer: true};
				}
				if(incomingState < currentState){
					// the incoming value is within the boundary of the machine's state, but not within the range.
					return {historical: true};
				}
				if(currentState < incomingState){
					// the incoming value is within both the boundary and the range of the machine's state.
					return {converge: true, incoming: true};
				}
				if(incomingState === currentState){
					if(incomingValue === currentValue){ // Note: while these are practically the same, the deltas could be technically different
						return {state: true};
					}
					/*
						The following is a naive implementation, but will always work.
						Never change it unless you have specific needs that absolutely require it.
						If changed, your data will diverge unless you guarantee every peer's algorithm has also been changed to be the same.
						As a result, it is highly discouraged to modify despite the fact that it is naive,
						because convergence (data integrity) is generally more important.
						Any difference in this algorithm must be given a new and different name.
					*/
					if(String(incomingValue) < String(currentValue)){ // String only works on primitive values!
						return {converge: true, current: true};
					}
					if(String(currentValue) < String(incomingValue)){ // String only works on primitive values!
						return {converge: true, incoming: true};
					}
				}
				return {err: "you have not properly handled recursion through your data or filtered it as JSON"};
			}

			Gun.union = function(gun, prime, cb, opt){ // merge two graphs into the first.
				var opt = opt || Gun.obj.is(cb)? cb : {};
				var ctx = {graph: gun.__.graph, count: 0};
				ctx.cb = function(){
					cb = Gun.fns.is(cb)? cb() && null : null;
				}
				if(!ctx.graph){ ctx.err = {err: Gun.log("No graph!") } }
				if(!prime){ ctx.err = {err: Gun.log("No data to merge!") } }
				if(ctx.soul = Gun.is.node.soul(prime)){ prime = Gun.is.graph.ify(prime) }
				if(!Gun.is.graph(prime, null, function(val, field, node){ var meta;
					if(!Gun.num.is(Gun.is.node.state(node, field))){
						return ctx.err = {err: Gun.log("No state on '" + field + "'!") }
					}
				}) || ctx.err){ return ctx.err = ctx.err || {err: Gun.log("Invalid graph!", prime)}, ctx }
				function emit(at){
					Gun.on('operating').emit(gun, at);
				}
				(function union(graph, prime){
					var prime = Gun.obj.map(prime, function(n,s,t){t(n)}).sort(function(A,B){
						var s = Gun.is.node.soul(A);
						if(graph[s]){ return 1 }
						return 0;
					});
					ctx.count += 1;
					ctx.err = Gun.list.map(prime, function(node, soul){
						soul = Gun.is.node.soul(node);
						if(!soul){ return {err: Gun.log("Soul missing or mismatching!")} }
						ctx.count += 1;
						var vertex = graph[soul];
						if(!vertex){ graph[soul] = vertex = Gun.is.node.ify({}, soul) }
						Gun.union.HAM(vertex, node, function(vertex, field, val, state){
							Gun.on('historical').emit(gun, {soul: soul, field: field, value: val, state: state, change: node});
							gun.__.on('historical').emit({soul: soul, field: field, change: node});
						}, function(vertex, field, val, state){
							if(!vertex){ return }
							var change = Gun.is.node.soul.ify({}, soul);
							if(field){
								Gun.is.node.state.ify([vertex, change, node], field, val);
							}
							emit({soul: soul, field: field, value: val, state: state, change: change});
						}, function(vertex, field, val){})(function(){
							emit({soul: soul, change: node});
							if(opt.soul){ opt.soul(soul) }
							if(!(ctx.count -= 1)){ ctx.cb() }
						}); // TODO: BUG? Handle error!
					});
					ctx.count -= 1;
				})(ctx.graph, prime);
				if(!ctx.count){ ctx.cb() }
				return ctx;
			}

			Gun.union.ify = function(gun, prime, cb, opt){
				if(gun){ gun = (gun.__ && gun.__.graph)? gun.__.graph : gun }
				if(Gun.text.is(prime)){
					if(gun && gun[prime]){
						prime = gun[prime];
					} else {
						return Gun.is.node.ify({}, prime);
					}
				}
				var vertex = Gun.is.node.soul.ify({}, Gun.is.node.soul(prime)), prime = Gun.is.graph.ify(prime) || prime;
				if(Gun.is.graph(prime, null, function(val, field){ var node;
					function merge(a, f, v){ Gun.is.node.state.ify(a, f, v) }
					if(Gun.is.rel(val)){ node = gun? gun[field] || prime[field] : prime[field] }
					Gun.union.HAM(vertex, node, function(){}, function(vert, f, v){
						merge([vertex, node], f, v);
					}, function(){})(function(err){
						if(err){ merge([vertex], field, val) }
					})
				})){ return vertex }
			}

			Gun.union.HAM = function(vertex, delta, lower, now, upper){
				upper.max = -Infinity;
				now.end = true;
				delta = delta || {};
				vertex = vertex || {};
				Gun.obj.map(delta._, function(v,f){
					if(Gun._.state === f || Gun._.soul === f){ return }
					vertex._[f] = v;
				});
				if(!Gun.is.node(delta, function update(incoming, field){
					now.end = false;
					var ctx = {incoming: {}, current: {}}, state;
					ctx.drift = Gun.time.now(); // DANGEROUS!
					ctx.incoming.value = Gun.is.rel(incoming) || incoming;
					ctx.current.value = Gun.is.rel(vertex[field]) || vertex[field];
					ctx.incoming.state = Gun.num.is(ctx.tmp = ((delta._||{})[Gun._.state]||{})[field])? ctx.tmp : -Infinity;
					ctx.current.state = Gun.num.is(ctx.tmp = ((vertex._||{})[Gun._.state]||{})[field])? ctx.tmp : -Infinity;
					upper.max = ctx.incoming.state > upper.max? ctx.incoming.state : upper.max;
					state = Gun.HAM(ctx.drift, ctx.incoming.state, ctx.current.state, ctx.incoming.value, ctx.current.value);
					if(state.err){
						root.console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err); // this error should never happen.
						return;
					}
					if(state.state || state.historical || state.current){
						lower.call(state, vertex, field, incoming, ctx.incoming.state);
						return;
					}
					if(state.incoming){
						now.call(state, vertex, field, incoming, ctx.incoming.state);
						return;
					}
					if(state.defer){
						upper.wait = true;
						upper.call(state, vertex, field, incoming, ctx.incoming.state); // signals that there are still future modifications.
						Gun.schedule(ctx.incoming.state, function(){
							update(incoming, field);
							if(ctx.incoming.state === upper.max){ (upper.last || function(){})() }
						});
					}
				})){ return function(fn){ if(fn){ fn({err: 'Not a node!'}) } } }
				if(now.end){ now.call({}, vertex) } // TODO: Should HAM handle empty updates? YES.
				return function(fn){
					upper.last = fn || function(){};
					if(!upper.wait){ upper.last() }
				}
			}

			Gun.on.at = function(on){ // On event emitter customized for gun.
				var proxy = function(e){ return proxy.e = e, proxy }
				proxy.emit = function(at){
					if(at.soul){
						at.hash = Gun.on.at.hash(at);
						//Gun.obj.as(proxy.mem, proxy.e)[at.soul] = at;
						Gun.obj.as(proxy.mem, proxy.e)[at.hash] = at;
					}
					if(proxy.all.cb){ proxy.all.cb(at, proxy.e) }
					on(proxy.e).emit(at);
					return {chain: function(c){
						if(!c || !c._ || !c._.at){ return }
						return c._.at(proxy.e).emit(at)
					}};
				}
				proxy.only = function(cb){
					if(proxy.only.cb){ return }
					return proxy.event(proxy.only.cb = cb);
				}
				proxy.all = function(cb){
					proxy.all.cb = cb;
					Gun.obj.map(proxy.mem, function(mem, e){
						Gun.obj.map(mem, function(at, i){
							cb(at, e);
						});
					});
				}
				proxy.event = function(cb, i){
					i = on(proxy.e).event(cb, i);
					return Gun.obj.map(proxy.mem[proxy.e], function(at){
						i.stat = {first: true};
						cb.call(i, at);
					}), i.stat = {}, i;
				}
				proxy.map = function(cb, i){
					return proxy.event(cb, i);
				};
				proxy.mem = {};
				return proxy;
			}

			Gun.on.at.hash = function(at){ return (at.at && at.at.soul)? at.at.soul + (at.at.field || '') : at.soul + (at.field || '') }

			Gun.on.at.copy = function(at){ return Gun.obj.del(at, 'hash'), Gun.obj.map(at, function(v,f,t){t(f,v)}) }

		}(Gun));

		;(function(Gun){ // Gun prototype chain methods.

			Gun.chain = Gun.prototype;

			Gun.chain.opt = function(opt, stun){
				opt = opt || {};
				var gun = this, root = (gun.__ && gun.__.gun)? gun.__.gun : (gun._ = gun.__ = {gun: gun}).gun.chain(); // if root does not exist, then create a root chain.
				root.__.by = root.__.by || function(f){ return gun.__.by[f] = gun.__.by[f] || {} };
				root.__.graph = root.__.graph || {};
				root.__.opt = root.__.opt || {};
				root.__.opt.wire = root.__.opt.wire || {};
				if(Gun.text.is(opt)){ opt = {peers: opt} }
				if(Gun.list.is(opt)){ opt = {peers: opt} }
				if(Gun.text.is(opt.peers)){ opt.peers = [opt.peers] }
				if(Gun.list.is(opt.peers)){ opt.peers = Gun.obj.map(opt.peers, function(n,f,m){ m(n,{}) }) }
				root.__.opt.peers = opt.peers || gun.__.opt.peers || {};
				Gun.obj.map(opt.wire, function(h, f){
					if(!Gun.fns.is(h)){ return }
					root.__.opt.wire[f] = h;
				});
				Gun.obj.map(['key', 'on', 'path', 'map', 'not', 'init'], function(f){
					if(!opt[f]){ return }
					root.__.opt[f] = opt[f] || root.__.opt[f];
				});
				if(!stun){ Gun.on('opt').emit(root, opt) }
				return gun;
			}

			Gun.chain.chain = function(s){
				var from = this, gun = !from.back? from : Gun(from);
				gun.back = gun.back || from;
				gun.__ = gun.__ || from.__;
				gun._ = gun._ || {};
				gun._.on = gun._.on || Gun.on.create();
				gun._.at = gun._.at || Gun.on.at(gun._.on);
				return gun;
			}

			Gun.chain.put = function(val, cb, opt){
				opt = opt || {};
				cb = cb || function(){}; cb.hash = {};
				var gun = this, chain = gun.chain(), tmp = {val: val}, drift = Gun.time.now();
				function put(at){
					var val = tmp.val;
					var ctx = {obj: val}; // prep the value for serialization
					ctx.soul = at.field? at.soul : (at.at && at.at.soul) || at.soul; // figure out where we are
					ctx.field = at.field? at.field : (at.at && at.at.field) || at.field; // did we come from some where?
					if(Gun.is(val)){
						if(!ctx.field){ return cb.call(chain, {err: ctx.err = Gun.log('No field to link node to!')}), chain._.at('err').emit(ctx.err) }
						return val.val(function(node){
							var soul = Gun.is.node.soul(node);
							if(!soul){ return cb.call(chain, {err: ctx.err = Gun.log('Only a node can be linked! Not "' + node + '"!')}), chain._.at('err').emit(ctx.err) }
							tmp.val = Gun.is.rel.ify(soul);
							put(at);
						});
					}
					if(cb.hash[at.hash = at.hash || Gun.on.at.hash(at)]){ return } // if we have already seen this hash...
					cb.hash[at.hash] = true; // else mark that we're processing the data (failure to write could still occur).
					ctx.by = chain.__.by(ctx.soul);
					ctx.not = at.not || (at.at && at.at.not);
					Gun.obj.del(at, 'not'); Gun.obj.del(at.at || at, 'not'); // the data is no longer not known! // TODO: BUG! It could have been asynchronous by the time we now delete these properties. Don't other parts of the code assume their deletion is synchronous?
					if(ctx.field){ Gun.obj.as(ctx.obj = {}, ctx.field, val) } // if there is a field, then data is actually getting put on the parent.
					else if(!Gun.obj.is(val)){ return cb.call(chain, ctx.err = {err: Gun.log("No node exists to put " + (typeof val) + ' "' + val + '" in!')}), chain._.at('err').emit(ctx.err) } // if the data is a primitive and there is no context for it yet, then we have an error.
					// TODO: BUG? gun.get(key).path(field).put() isn't doing it as pseudo.
					function soul(env, cb, map){ var eat;
						if(!env || !(eat = env.at) || !env.at.node){ return }
						if(!eat.node._){ eat.node._ = {} }
						if(!eat.node._[Gun._.state]){ eat.node._[Gun._.state] = {} }
						if(!Gun.is.node.soul(eat.node)){
							if(ctx.obj === eat.obj){
								Gun.obj.as(env.graph, eat.soul = Gun.obj.as(eat.node._, Gun._.soul, Gun.is.node.soul(eat.obj) || ctx.soul), eat.node);
								cb(eat, eat.soul);
							} else {
								var path = function(err, node){
									if(path.opt && path.opt.on && path.opt.on.off){ path.opt.on.off() }
									if(path.opt.done){ return }
									path.opt.done = true;
									if(err){ env.err = err }
									eat.soul = Gun.is.node.soul(node) || Gun.is.node.soul(eat.obj) || Gun.is.node.soul(eat.node) || Gun.text.random();
									Gun.obj.as(env.graph, Gun.obj.as(eat.node._, Gun._.soul, eat.soul), eat.node);
									cb(eat, eat.soul);
								}; path.opt = {put: true};
								(ctx.not)? path() : ((at.field || at.at)? gun.back : gun).path(eat.path || [], path, path.opt);
							}
						}
						if(!eat.field){ return }
						eat.node._[Gun._.state][eat.field] = drift;
					}
					function end(err, ify){
						ctx.ify = ify;
						Gun.on('put').emit(chain, at, ctx, opt, cb, val);
						if(err || ify.err){ return cb.call(chain, err || ify.err), chain._.at('err').emit(err || ify.err) } // check for serialization error, emit if so.
						if(err = Gun.union(chain, ify.graph, {end: false, soul: function(soul){
							if(chain.__.by(soul).end){ return }
							Gun.union(chain, Gun.is.node.soul.ify({}, soul)); // fire off an end node if there hasn't already been one, to comply with the wire spec.
						}}).err){ return cb.call(chain, err), chain._.at('err').emit(err) } // now actually union the serialized data, emit error if any occur.
						if(Gun.fns.is(end.wire = chain.__.opt.wire.put)){
							var wcb = function(err, ok, info){
								if(err){ return Gun.log(err.err || err), cb.call(chain, err), chain._.at('err').emit(err) }
								return cb.call(chain, err, ok);
							}
							end.wire(ify.graph, wcb, opt);
						} else {
							if(!Gun.log.count('no-wire-put')){ Gun.log("Warning! You have no persistence layer to save to!") }
							cb.call(chain, null); // This is in memory success, hardly "success" at all.
						}
						if(ctx.field){
							return gun.back.path(ctx.field, null, {chain: opt.chain || chain});
						}
						if(ctx.not){
							return gun.__.gun.get(ctx.soul, null, {chain: opt.chain || chain});
						}
						chain.get(ctx.soul, null, {chain: opt.chain || chain, at: gun._.at })
					}
					Gun.ify(ctx.obj, soul, {pure: true})(end); // serialize the data!
				}
				if(gun === gun.back){ // if we are the root chain...
					put({soul: Gun.is.node.soul(val) || Gun.text.random(), not: true}); // then cause the new chain to save data!
				} else { // else if we are on an existing chain then...
					gun._.at('soul').map(put); // put data on every soul that flows through this chain.
					var back = function(gun){
						if(gun.back === gun || gun._.not){ return } // TODO: CLEAN UP! Would be ideal to accomplish this in a more ideal way.
						gun._.at('null').event(function(at){
							if(opt.init || gun.__.opt.init){ return Gun.log("Warning! You have no context to `.put`", val, "!") }
							gun.init();
						}, -999);
						return back(gun.back);
					};
					if(!opt.init && !gun.__.opt.init){ back(gun) }
				}
				chain.back = gun.back;
				return chain;
			}

			Gun.chain.get = (function(){
				Gun.on('operating').event(function(gun, at){
					if(!gun.__.by(at.soul).node){ gun.__.by(at.soul).node = gun.__.graph[at.soul]  }
					if(at.field){ return } // TODO: It would be ideal to reuse HAM's field emit.
					gun.__.on(at.soul).emit(at);
				});
				Gun.on('get').event(function(gun, at, ctx, opt, cb){
					if(ctx.halt){ return } // TODO: CLEAN UP with event emitter option?
					at.change = at.change || gun.__.by(at.soul).node;
					if(opt.raw){ return cb.call(opt.on, at) }
					if(!ctx.cb.no){ cb.call(ctx.by.chain, null, Gun.obj.copy(ctx.node || gun.__.by(at.soul).node)) }
					gun._.at('soul').emit(at).chain(opt.chain);
				},0);
				Gun.on('get').event(function(gun, at, ctx){
					if(ctx.halt){ ctx.halt = false; return } // TODO: CLEAN UP with event emitter option?
				}, Infinity);
				return function(lex, cb, opt){ // get opens up a reference to a node and loads it.
					var gun = this, ctx = {
						opt: opt || {},
						cb: cb || function(){},
						lex: (Gun.text.is(lex) || Gun.num.is(lex))? Gun.is.rel.ify(lex) : lex,
					};
					ctx.force = ctx.opt.force;
					if(cb !== ctx.cb){ ctx.cb.no = true }
					if(!Gun.obj.is(ctx.lex)){ return ctx.cb.call(gun = gun.chain(), {err: Gun.log('Invalid get request!', lex)}), gun }
					if(!(ctx.soul = ctx.lex[Gun._.soul])){ return ctx.cb.call(gun = this.chain(), {err: Gun.log('No soul to get!')}), gun } // TODO: With `.all` it'll be okay to not have an exact match!
					ctx.by = gun.__.by(ctx.soul);
					ctx.by.chain = ctx.by.chain || gun.chain();
					function load(lex){
						var soul = lex[Gun._.soul];
						var cached = gun.__.by(soul).node || gun.__.graph[soul];
						if(ctx.force){ ctx.force = false }
						else if(cached){ return false }
						wire(lex, stream, ctx.opt);
						return true;
					}
					function stream(err, data, info){
						Gun.on('wire.get').emit(ctx.by.chain, ctx, err, data, info);
						if(err){
							Gun.log(err.err || err);
							ctx.cb.call(ctx.by.chain, err);
							return ctx.by.chain._.at('err').emit({soul: ctx.soul, err: err.err || err}).chain(ctx.opt.chain);
						}
						if(!data){
							ctx.cb.call(ctx.by.chain, null);
							return ctx.by.chain._.at('null').emit({soul: ctx.soul, not: true}).chain(ctx.opt.chain);
						}
						if(Gun.obj.empty(data)){ return }
						if(err = Gun.union(ctx.by.chain, data).err){
							ctx.cb.call(ctx.by.chain, err);
							return ctx.by.chain._.at('err').emit({soul: Gun.is.node.soul(data) || ctx.soul, err: err.err || err}).chain(ctx.opt.chain);
						}
					}
					function wire(lex, cb, opt){
						Gun.on('get.wire').emit(ctx.by.chain, ctx, lex, cb, opt);
						if(Gun.fns.is(gun.__.opt.wire.get)){ return gun.__.opt.wire.get(lex, cb, opt) }
						if(!Gun.log.count('no-wire-get')){ Gun.log("Warning! You have no persistence layer to get from!") }
						cb(null); // This is in memory success, hardly "success" at all.
					}
					function on(at){
						if(on.ran = true){ ctx.opt.on = this }
						if(load(ctx.lex)){ return }
						Gun.on('get').emit(ctx.by.chain, at, ctx, ctx.opt, ctx.cb, ctx.lex);
					}
					ctx.opt.on = (ctx.opt.at || gun.__.at)(ctx.soul).event(on);
					if(!ctx.opt.ran && !on.ran){ on.call(ctx.opt.on, {soul: ctx.soul}) }
					return ctx.by.chain;
				}
			}());

			Gun.chain.key = (function(){
				Gun.on('put').event(function(gun, at, ctx, opt, cb){
					if(opt.key){ return }
					Gun.is.graph(ctx.ify.graph, function(node, soul){
						var key = {node: gun.__.graph[soul]};
						if(!Gun.is.node.soul(key.node, 'key')){ return }
						if(!gun.__.by(soul).end){ gun.__.by(soul).end = 1 }
						Gun.is.node(key.node, function(rel, s){
							rel = ctx.ify.graph[s] = ctx.ify.graph[s] || Gun.is.node.soul.ify({}, s);
							Gun.is.node(node, function(v,f){ Gun.is.node.state.ify([rel, node], f, v) });
							Gun.obj.del(ctx.ify.graph, soul);
						})
					});
				});
				Gun.on('get').event(function(gun, at, ctx, opt, cb){
					if(ctx.halt){ return } // TODO: CLEAN UP with event emitter option?
					if(opt.key && opt.key.soul){
						at.soul = opt.key.soul;
						gun.__.by(opt.key.soul).node = Gun.union.ify(gun, opt.key.soul); // TODO: Check performance?
						gun.__.by(opt.key.soul).node._['key'] = 'pseudo';
						at.change = Gun.is.node.soul.ify(Gun.obj.copy(at.change || gun.__.by(at.soul).node), at.soul, true); // TODO: Check performance?
						return;
					}
					if(!(Gun.is.node.soul(gun.__.graph[at.soul], 'key') === 1)){ return }
					var node = at.change || gun.__.graph[at.soul];
					function map(rel, soul){ gun.__.gun.get(rel, cb, {key: ctx, chain: opt.chain || gun, force: opt.force}) }
					ctx.halt = true;
					Gun.is.node(node, map);
				},-999);
				return function(key, cb, opt){
					var gun = this;
					opt = Gun.text.is(opt)? {soul: opt} : opt || {};
					cb = cb || function(){}; cb.hash = {};
					if(!Gun.text.is(key) || !key){ return cb.call(gun, {err: Gun.log('No key!')}), gun }
					function index(at){
						var ctx = {node: gun.__.graph[at.soul]};
						if(at.soul === key || at.key === key){ return }
						if(cb.hash[at.hash = at.hash || Gun.on.at.hash(at)]){ return } cb.hash[at.hash] = true;
						ctx.obj = (1 === Gun.is.node.soul(ctx.node, 'key'))? Gun.obj.copy(ctx.node) : Gun.obj.put({}, at.soul, Gun.is.rel.ify(at.soul));
						Gun.obj.as((ctx.put = Gun.is.node.ify(ctx.obj, key, true))._, 'key', 1);
						gun.__.gun.put(ctx.put, function(err, ok){cb.call(this, err, ok)}, {chain: opt.chain, key: true, init: true});
					}
					if(opt.soul){
						index({soul: opt.soul});
						return gun;
					}
					if(gun === gun.back){
						cb.call(gun, {err: Gun.log('You have no context to `.key`', key, '!')});
					} else {
						gun._.at('soul').map(index);
					}
					return gun;
				}
			}());

			Gun.chain.on = function(cb, opt){ // on subscribes to any changes on the souls.
				var gun = this, u;
				opt = Gun.obj.is(opt)? opt : {change: opt};
				cb = cb || function(){};
				function map(at){
					opt.on = opt.on || this;
					var ctx = {by: gun.__.by(at.soul)}, change = ctx.by.node;
					if(opt.on.stat && opt.on.stat.first){ (at = Gun.on.at.copy(at)).change = ctx.by.node }
					if(opt.raw){ return cb.call(opt.on, at) }
					if(opt.once){ this.off() }
					if(opt.change){ change = at.change }
					if(!opt.empty && Gun.obj.empty(change, Gun._.meta)){ return }
					cb.call(ctx.by.chain || gun, Gun.obj.copy(at.field? change[at.field] : change), at.field || (at.at && at.at.field));
				};
				opt.on = gun._.at('soul').map(map);
				if(gun === gun.back){ Gun.log('You have no context to `.on`!') }
				return gun;
			}

			Gun.chain.path = (function(){
				Gun.on('get').event(function(gun, at, ctx, opt, cb, lex){
					if(ctx.halt){ return } // TODO: CLEAN UP with event emitter option?
					if(opt.path){ at.at = opt.path }
					var xtc = {soul: lex[Gun._.soul], field: lex[Gun._.field]};
					xtc.change = at.change || gun.__.by(at.soul).node;
					if(xtc.field){ // TODO: future feature!
						if(!Gun.obj.has(xtc.change, xtc.field)){ return }
						ctx.node = Gun.is.node.soul.ify({}, at.soul); // TODO: CLEAN UP! ctx.node usage.
						Gun.is.node.state.ify([ctx.node, xtc.change], xtc.field, xtc.change[xtc.field]);
						at.change = ctx.node; at.field = xtc.field;
					}
				},-99);
				Gun.on('get').event(function(gun, at, ctx, opt, cb, lex){
					if(ctx.halt){ return } // TODO: CLEAN UP with event emitter option?
					var xtc = {}; xtc.change = at.change || gun.__.by(at.soul).node;
					if(!opt.put){ // TODO: CLEAN UP be nice if path didn't have to worry about this.
						Gun.is.node(xtc.change, function(v,f){
							var fat = Gun.on.at.copy(at); fat.field = f; fat.value = v;
							Gun.obj.del(fat, 'at'); // TODO: CLEAN THIS UP! It would be nice in every other function every where else it didn't matter whether there was a cascading at.at.at.at or not, just and only whether the current context as a field or should rely on a previous field. But maybe that is the gotcha right there?
							fat.change = fat.change || xtc.change;
							if(v = Gun.is.rel(fat.value)){ fat = {soul: v, at: fat} }
							gun._.at('path:' + f).emit(fat).chain(opt.chain);
						});
					}
					if(!ctx.end){
						ctx.end = gun._.at('end').emit(at).chain(opt.chain);
					}
				},99);
				return function(path, cb, opt){
					opt = opt || {};
					cb = cb || (function(){ var cb = function(){}; cb.no = true; return cb }()); cb.hash = {};
					var gun = this, chain = gun.chain(), f, c, u;
					if(!Gun.list.is(path)){ if(!Gun.text.is(path)){ if(!Gun.num.is(path)){ // if not a list, text, or number
						return cb.call(chain, {err: Gun.log("Invalid path '" + path + "'!")}), chain; // then complain
					} else { return this.path(path + '', cb, opt)  } } else { return this.path(path.split('.'), cb, opt) } } // else coerce upward to a list.
					if(gun === gun.back){
						cb.call(chain, opt.put? null : {err: Gun.log('You have no context to `.path`', path, '!')});
						return chain;
					}
					gun._.at('path:' + path[0]).event(function(at){
						if(opt.done){ this.off(); return } // TODO: BUG - THIS IS A FIX FOR A BUG! TEST #"context no double emit", COMMENT THIS LINE OUT AND SEE IT FAIL!
						var ctx = {soul: at.soul, field: at.field, by: gun.__.by(at.soul)}, field = path[0];
						var on = Gun.obj.as(cb.hash, at.hash, {off: function(){}});
						if(at.soul === on.soul){ return }
						else { on.off() }
						if(ctx.rel = (Gun.is.rel(at.value) || Gun.is.rel(at.at && at.at.value))){
							if(opt.put && 1 === path.length){
								return cb.call(ctx.by.chain || chain, null, Gun.is.node.soul.ify({}, ctx.rel));
							}
							var get = function(err, node){
								if(!err && 1 !== path.length){ return }
								cb.call(this, err, node, field);
							};
							ctx.opt = {chain: opt.chain || chain, put: opt.put, path: {soul: (at.at && at.at.soul) || at.soul, field: field }};
							gun.__.gun.get(ctx.rel || at.soul, cb.no? null : get, ctx.opt);
							(opt.on = cb.hash[at.hash] = on = ctx.opt.on).soul = at.soul; // TODO: BUG! CB getting reused as the hash point for multiple paths potentially! Could cause problems!
							return;
						}
						if(1 === path.length){ cb.call(ctx.by.chain || chain, null, at.value, ctx.field) }
						chain._.at('soul').emit(at).chain(opt.chain);
					});
					gun._.at('null').only(function(at){
						if(!at.field){ return }
						if(at.not){
							gun.put({}, null, {init: true});
							if(opt.init || gun.__.opt.init){ return }
						}
						(at = Gun.on.at.copy(at)).field = path[0];
						at.not = true;
						chain._.at('null').emit(at).chain(opt.chain);
					});
					gun._.at('end').event(function(at){
						this.off();
						if(at.at && at.at.field === path[0]){ return } // TODO: BUG! THIS FIXES SO MANY PROBLEMS BUT DOES IT CATCH VARYING SOULS EDGE CASE?
						var ctx = {by: gun.__.by(at.soul)};
						if(Gun.obj.has(ctx.by.node, path[0])){ return }
						(at = Gun.on.at.copy(at)).field = path[0];
						at.not = true;
						cb.call(ctx.by.chain || chain, null);
						chain._.at('null').emit(at).chain(opt.chain);
					});
					if(path.length > 1){
						(c = chain.path(path.slice(1), cb, opt)).back = gun;
					}
					return c || chain;
				}
			}());

			Gun.chain.map = function(cb, opt){
				var u, gun = this, chain = gun.chain();
				cb = cb || function(){}; cb.hash = {};
				opt = Gun.bi.is(opt)? {change: opt} : opt || {};
				opt.change = Gun.bi.is(opt.change)? opt.change : true;
				function path(err, val, field){
					if(err || (val === u)){ return }
					cb.call(this, val, field);
				}
				function each(val, field){
					//if(!Gun.is.rel(val)){ path.call(this.gun, null, val, field);return;}
					cb.hash[this.soul + field] = cb.hash[this.soul + field] || this.gun.path(field, path, {chain: chain, via: 'map'}); // TODO: path should reuse itself! We shouldn't have to do it ourselves.
					// TODO:
					// 1. Ability to turn off an event. // automatically happens within path since reusing is manual?
					// 2. Ability to pass chain context to fire on. // DONE
					// 3. Pseudoness handled for us. // DONE
					// 4. Reuse. // MANUALLY DONE
				}
				function map(at){
					var ref = gun.__.by(at.soul).chain || gun;
					Gun.is.node(at.change, each, {gun: ref, soul: at.soul});
				}
				gun.on(map, {raw: true, change: true}); // TODO: ALLOW USER TO DO map change false!
				if(gun === gun.back){ Gun.log('You have no context to `.map`!') }
				return chain;
			}

			Gun.chain.val = (function(){
				Gun.on('get.wire').event(function(gun, ctx){
					if(!ctx.soul){ return } var end;
					(end = gun.__.by(ctx.soul)).end = (end.end || -1); // TODO: CLEAN UP! This should be per peer!
				},-999);
				Gun.on('wire.get').event(function(gun, ctx, err, data){
					if(err || !ctx.soul){ return }
					if(data && !Gun.obj.empty(data, Gun._.meta)){ return }
					var end = gun.__.by(ctx.soul);
					end.end = (!end.end || end.end < 0)? 1 : end.end + 1;
				},-999);
				return function(cb, opt){
					var gun = this, args = Gun.list.slit.call(arguments);
					cb = Gun.fns.is(cb)? cb : function(val, field){ root.console.log.apply(root.console, args.concat([field && (field += ':'), val])) }; cb.hash = {};
					opt = opt || {};
					function val(at){
						var ctx = {by: gun.__.by(at.soul), at: at.at || at}, node = ctx.by.node, field = ctx.at.field, hash = Gun.on.at.hash({soul: ctx.at.key || ctx.at.soul, field: field});
						if(cb.hash[hash]){ return }
						if(at.field && Gun.obj.has(node, at.field)){
							return cb.hash[hash] = true, cb.call(ctx.by.chain || gun, Gun.obj.copy(node[at.field]), at.field);
						}
						if(!opt.empty && Gun.obj.empty(node, Gun._.meta)){ return } // TODO: CLEAN UP! .on already does this without the .raw!
						if(ctx.by.end < 0){ return }
						return cb.hash[hash] = true, cb.call(ctx.by.chain || gun, Gun.obj.copy(node), field);
					}
					gun.on(val, {raw: true});
					if(gun === gun.back){ Gun.log('You have no context to `.val`!') }
					return gun;
				}
			}());

			Gun.chain.not = function(cb, opt){
				var gun = this, chain = gun.chain();
				cb = cb || function(){};
				opt = opt || {};
				function not(at,e){
					if(at.field){
						if(Gun.obj.has(gun.__.by(at.soul).node, at.field)){ return Gun.obj.del(at, 'not'), chain._.at(e).emit(at) }
					} else
					if(at.soul && gun.__.by(at.soul).node){ return Gun.obj.del(at, 'not'), chain._.at(e).emit(at) }
					if(!at.not){ return }
					var kick = function(next){
						if(++kick.c){ return Gun.log("Warning! Multiple `not` resumes!"); }
						next._.at.all(function(on ,e){ // TODO: BUG? Switch back to .at? I think .on is actually correct so it doesn't memorize. // TODO: BUG! What about other events?
							chain._.at(e).emit(on);
						});
					};
					kick.c = -1
					kick.chain = gun.chain();
					kick.next = cb.call(kick.chain, opt.raw? at : (at.field || at.soul || at.not), kick);
					kick.soul = Gun.text.random();
					if(Gun.is(kick.next)){ kick(kick.next) }
					kick.chain._.at('soul').emit({soul: kick.soul, field: at.field, not: true, via: 'not'});
				}
				gun._.at.all(not);
				if(gun === gun.back){ Gun.log('You have no context to `.not`!') }
				chain._.not = true; // TODO: CLEAN UP! Would be ideal if we could accomplish this in a more elegant way.
				return chain;
			}

			Gun.chain.set = function(item, cb, opt){
				var gun = this, ctx = {};
				if(!Gun.is(item)){ return cb.call(gun, {err: Gun.log('Set only supports node references currently!')}), gun }
				item.val(function(node){
					if(ctx.done){ return } ctx.done = true;
					var put = {}, soul = Gun.is.node.soul(node);
					if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + node + '"!')}) }
					gun.put(Gun.obj.put(put, soul, Gun.is.rel.ify(soul)), cb, opt);
				})
				return gun;
			}

			Gun.chain.init = function(cb, opt){
				var gun = this;
				gun._.at('null').event(function(at){
					if(!at.not){ return } // TODO: BUG! This check is synchronous but it could be asynchronous!
					var ctx = {by: gun.__.by(at.soul)};
					if(at.field){
						if(Gun.obj.has(ctx.by.node, at.field)){ return }
						gun._.at('soul').emit({soul: at.soul, field: at.field, not: true});
						return;
					}
					if(at.soul){
						if(ctx.by.node){ return }
						var soul = Gun.text.random();
						gun.__.gun.put(Gun.is.node.soul.ify({}, soul), null, {init: true});
						gun.__.gun.key(at.soul, null, soul);
					}
				}, {raw: true});
				return gun;
			}

		}(Gun));

		;(function(Gun){ // Javascript to Gun Serializer.
			function ify(data, cb, opt){
				opt = opt || {};
				cb = cb || function(env, cb){ cb(env.at, Gun.is.node.soul(env.at.obj) || Gun.is.node.soul(env.at.node) || Gun.text.random()) };
				var end = function(fn){
					ctx.end = fn || function(){};
					unique(ctx);
				}, ctx = {at: {path: [], obj: data}, root: {}, graph: {}, queue: [], seen: [], opt: opt, loop: true};
				if(!data){ return ctx.err = {err: Gun.log('Serializer does not have correct parameters.')}, end }
				if(ctx.opt.start){ Gun.is.node.soul.ify(ctx.root, ctx.opt.start) }
				ctx.at.node = ctx.root;
				while(ctx.loop && !ctx.err){
					seen(ctx, ctx.at);
					map(ctx, cb);
					if(ctx.queue.length){
						ctx.at = ctx.queue.shift();
					} else {
						ctx.loop = false;
					}
				}
				return end;
			}
			function map(ctx, cb){
				var u, rel = function(at, soul){
					at.soul = at.soul || soul || Gun.is.node.soul(at.obj) || Gun.is.node.soul(at.node);
					if(!ctx.opt.pure){
						ctx.graph[at.soul] = Gun.is.node.soul.ify(at.node, at.soul);
						if(ctx.at.field){
							Gun.is.node.state.ify([at.node], at.field, u, ctx.opt.state);
						}
					}
					Gun.list.map(at.back, function(rel){
						rel[Gun._.soul] = at.soul;
					});
					unique(ctx);
				}, it;
				Gun.obj.map(ctx.at.obj, function(val, field){
					ctx.at.val = val;
					ctx.at.field = field;
					it = cb(ctx, rel, map) || true;
					if(field === Gun._.meta){
						ctx.at.node[field] = Gun.obj.copy(val); // TODO: BUG! Is this correct?
						return;
					}
					if(String(field).indexOf('.') != -1 || (false && notValidField(field))){ // TODO: BUG! Do later for ACID "consistency" guarantee.
						return ctx.err = {err: Gun.log("Invalid field name on '" + ctx.at.path.join('.') + "'!")};
					}
					if(!Gun.is.val(val)){
						var at = {obj: val, node: {}, back: [], path: [field]}, tmp = {}, was;
						at.path = (ctx.at.path||[]).concat(at.path || []);
						if(!Gun.obj.is(val)){
							return ctx.err = {err: Gun.log("Invalid value at '" + at.path.join('.') + "'!" )};
						}
						if(was = seen(ctx, at)){
							tmp[Gun._.soul] = Gun.is.node.soul(was.node) || null;
							(was.back = was.back || []).push(ctx.at.node[field] = tmp);
						} else {
							ctx.queue.push(at);
							tmp[Gun._.soul] = null;
							at.back.push(ctx.at.node[field] = tmp);
						}
					} else {
						ctx.at.node[field] = Gun.obj.copy(val);
					}
				});
				if(!it){ cb(ctx, rel) }
			}
			function unique(ctx){
				if(ctx.err || (!Gun.list.map(ctx.seen, function(at){
					if(!at.soul){ return true }
				}) && !ctx.loop)){ return ctx.end(ctx.err, ctx), ctx.end = function(){}; }
			}
			function seen(ctx, at){
				return Gun.list.map(ctx.seen, function(has){
					if(at.obj === has.obj){ return has }
				}) || (ctx.seen.push(at) && false);
			}
			ify.wire = function(n, cb, opt){ return Gun.text.is(n)? ify.wire.from(n, cb, opt) : ify.wire.to(n, cb, opt) }
			ify.wire.to = function(n, cb, opt){ var t, b;
				if(!n || !(t = Gun.is.node.soul(n))){ return null }
				cb = cb || function(){};
				t = (b = "#'" + JSON.stringify(t) + "'");
				Gun.obj.map(n, function(v,f){
					if(Gun._.meta === f){ return }
					var w = '', s = Gun.is.node.state(n,f);
					if(!s){ return }
					w += ".'" + JSON.stringify(f) + "'";
					w += "='" + JSON.stringify(v) + "'";
					w += ">'" + JSON.stringify(s) + "'";
					t += w;
					w = b + w;
					cb(null, w);
				});
				return t;
			}
			ify.wire.from = function(n, cb, opt){
				if(!n){ return null }
				var a = [], s = -1, e = 0, end = 1;
				while((e = n.indexOf("'", s + 1)) >= 0){
					if(s === e || '\\' === n.charAt(e-1)){}else{
						a.push(n.slice(s + 1,e));
						s = e;
					}
				}
				return a;
			}
			Gun.ify = ify;
		}(Gun));

		var root = this || {}; // safe for window, global, root, and 'use strict'.
		if(root.window){ window.Gun = Gun }
		if(typeof module !== "undefined" && module.exports){ module.exports = Gun }
		root.console = root.console || {log: function(s){ return s }}; // safe for old browsers
		var console = {
			log: function(s){return root.console.log.apply(root.console, arguments), s},
			Log: Gun.log = function(s){ return (!Gun.log.squelch && root.console.log.apply(root.console, arguments)), s }
		};
		console.debug = function(i, s){ return (Gun.log.debug && i === Gun.log.debug && Gun.log.debug++) && root.console.log.apply(root.console, arguments), s };
		Gun.log.count = function(s){ return Gun.log.count[s] = Gun.log.count[s] || 0, Gun.log.count[s]++ }
	}());


	;(function(Tab){

		if(!this.Gun){ return }
		if(!window.JSON){ throw new Error("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use

		;(function(exports){
			function s(){}
			s.put = function(key, val){ return store.setItem(key, Gun.text.ify(val)) }
			s.get = function(key, cb){ setTimeout(function(){ return cb(null, Gun.obj.ify(store.getItem(key) || null)) },1)}
			s.del = function(key){ return store.removeItem(key) }
			var store = this.localStorage || {setItem: function(){}, removeItem: function(){}, getItem: function(){}};
			exports.store = s;
		}(Tab));

		Gun.on('opt').event(function(gun, opt){
			opt = opt || {};
			var tab = gun.tab = gun.tab || {};
			tab.store = tab.store || Tab.store;
			tab.request = tab.request || request;
			tab.headers = opt.headers || {};
			tab.headers['gun-sid'] = tab.headers['gun-sid'] || Gun.text.random(); // stream id
			tab.prefix = tab.prefix || opt.prefix || 'gun/';
			tab.get = tab.get || function(lex, cb, opt){
				if(!lex){ return }
				var soul = lex[Gun._.soul];
				if(!soul){ return }
				cb = cb || function(){};
				cb.GET = true;
				(opt = opt || {}).url = opt.url || {};
				opt.headers = Gun.obj.copy(tab.headers);
				opt.url.pathname = '/' + soul;
				//Gun.log("tab get --->", lex);
				(function local(soul, cb){
					tab.store.get(tab.prefix + soul, function(err, data){
						if(!data){ return } // let the peers handle no data.
						if(err){ return cb(err) }
						cb(err, cb.node = data); // node
						cb(err, Gun.is.node.soul.ify({}, Gun.is.node.soul(data))); // end
						cb(err, {}); // terminate
					});
				}(soul, cb));
				if(!(cb.local = opt.local)){
					Gun.obj.map(opt.peers || gun.__.opt.peers, function(peer, url){ var p = {};
						tab.request(url, null, tab.error(cb, "Error: Get failed through " + url, function(reply){
							if(!p.node && cb.node){ // if we have local data
								//Gun.log("tab get <---", lex);
								tab.put(Gun.is.graph.ify(p.node = cb.node), function(e,r){ // then sync it if we haven't already
									//Gun.log("Stateless handshake sync:", e, r);
								}, {peers: tab.peers(url)}); // to the peer. // TODO: This forces local to flush again, not necessary.
							}
							setTimeout(function(){ tab.put(reply.body, function(){}, {local: true}) },1); // and flush the in memory nodes of this graph to localStorage after we've had a chance to union on it.
						}), opt);
						cb.peers = true;
					});
				} tab.peers(cb);
			}
			tab.put = tab.put || function(graph, cb, opt){
				cb = cb || function(){};
				opt = opt || {};
				Gun.is.graph(graph, function(node, soul){
					if(!gun.__.graph[soul]){ return }
					tab.store.put(tab.prefix + soul, gun.__.graph[soul]);
				});
				if(!(cb.local = opt.local)){
					Gun.obj.map(opt.peers || gun.__.opt.peers, function(peer, url){
						tab.request(url, graph, tab.error(cb, "Error: Put failed on " + url), {headers: tab.headers});
						cb.peers = true;
					});
				} tab.peers(cb);
			}
			tab.error = function(cb, error, fn){
				return function(err, reply){
					reply.body = reply.body || reply.chunk || reply.end || reply.write;
					if(err || !reply || (err = reply.body && reply.body.err)){
						return cb({err: Gun.log(err || error) });
					}
					if(fn){ fn(reply) }
					cb(null, reply.body);
				}
			}
			tab.peers = function(cb, o){
				if(Gun.text.is(cb)){ return (o = {})[cb] = {}, o }
				if(cb && !cb.peers){ setTimeout(function(){
					if(!cb.local){ if(!Gun.log.count('no-peers')){ Gun.log("Warning! You have no peers to connect to!") } }
					if(!(cb.graph || cb.node)){ cb(null) }
				},1)}
			}
			tab.server = tab.server || function(req, res){
				if(!req || !res || !req.url || !req.method){ return }
				req.url = req.url.href? req.url : document.createElement('a');
				req.url.href = req.url.href || req.url;
				req.url.key = (req.url.pathname||'').replace(tab.server.regex,'').replace(/^\//i,'') || '';
				req.method = req.body? 'put' : 'get';
				if('get' == req.method){ return tab.server.get(req, res) }
				if('put' == req.method || 'post' == req.method){ return tab.server.put(req, res) }
			}
			tab.server.json = 'application/json';
			tab.server.regex = gun.__.opt.route = gun.__.opt.route || opt.route || /^\/gun/i;
			tab.server.get = function(){}
			tab.server.put = function(req, cb){
				var reply = {headers: {'Content-Type': tab.server.json}};
				if(!req.body){ return cb({headers: reply.headers, body: {err: "No body"}}) }
				// TODO: Re-emit message to other peers if we have any non-overlaping ones.
				if(req.err = Gun.union(gun, req.body, function(err, ctx){
					if(err){ return cb({headers: reply.headers, body: {err: err || "Union failed."}}) }
					var ctx = ctx || {}; ctx.graph = {};
					Gun.is.graph(req.body, function(node, soul){ ctx.graph[soul] = gun.__.graph[soul] });
					gun.__.opt.wire.put(ctx.graph, function(err, ok){
						if(err){ return cb({headers: reply.headers, body: {err: err || "Failed."}}) }
						cb({headers: reply.headers, body: {ok: ok || "Persisted."}});
					}, {local: true});
				}).err){ cb({headers: reply.headers, body: {err: req.err || "Union failed."}}) }
			}
			Gun.obj.map(gun.__.opt.peers, function(){ // only create server if peers and do it once by returning immediately.
				return (tab.server.able = tab.server.able || tab.request.createServer(tab.server) || true);
			});
			gun.__.opt.wire.get = gun.__.opt.wire.get || tab.get;
			gun.__.opt.wire.put = gun.__.opt.wire.put || tab.put;
			gun.__.opt.wire.key = gun.__.opt.wire.key || tab.key;
		});

		var request = (function(){
			function r(base, body, cb, opt){
				opt = opt || (base.length? {base: base} : base);
				opt.base = opt.base || base;
				opt.body = opt.body || body;
				if(!opt.base){ return }
				r.transport(opt, cb);
			}
			r.createServer = function(fn){ r.createServer.s.push(fn) }
			r.createServer.ing = function(req, cb){
				var i = r.createServer.s.length;
				while(i--){ (r.createServer.s[i] || function(){})(req, cb) }
			}
			r.createServer.s = [];
			r.back = 2; r.backoff = 2;
			r.transport = function(opt, cb){
				//Gun.log("TRANSPORT:", opt);
				if(r.ws(opt, cb)){ return }
				r.jsonp(opt, cb);
			}
			r.ws = function(opt, cb){
				var ws, WS = window.WebSocket || window.mozWebSocket || window.webkitWebSocket;
				if(!WS){ return }
				if(ws = r.ws.peers[opt.base]){
					if(!ws.readyState){ return setTimeout(function(){ r.ws(opt, cb) },10), true }
					var req = {};
					if(opt.headers){ req.headers = opt.headers }
					if(opt.body){ req.body = opt.body }
					if(opt.url){ req.url = opt.url }
					req.headers = req.headers || {};
					r.ws.cbs[req.headers['ws-rid'] = 'WS' + (+ new Date()) + '.' + Math.floor((Math.random()*65535)+1)] = function(err,res){
						if(res.body || res.end){ delete r.ws.cbs[req.headers['ws-rid']] }
						cb(err,res);
					}
					ws.send(JSON.stringify(req));
					return true;
				}
				if(ws === false){ return }
				ws = r.ws.peers[opt.base] = new WS(opt.base.replace('http','ws'));
				ws.onopen = function(o){ r.back = 2; r.ws(opt, cb) };
				ws.onclose = window.onbeforeunload = function(c){
					if(!c){ return }
					if(ws && ws.close instanceof Function){ ws.close() }
					if(1006 === c.code){ // websockets cannot be used
						/*ws = r.ws.peers[opt.base] = false; // 1006 has mixed meanings, therefore we can no longer respect it.
						r.transport(opt, cb);
						return;*/
					}
					ws = r.ws.peers[opt.base] = null; // this will make the next request try to reconnect
					setTimeout(function(){
						r.ws(opt, function(){}); // opt here is a race condition, is it not? Does this matter?
					}, r.back *= r.backoff);
				};
				ws.onmessage = function(m){
					if(!m || !m.data){ return }
					var res;
					try{res = JSON.parse(m.data);
					}catch(e){ return }
					if(!res){ return }
					res.headers = res.headers || {};
					if(res.headers['ws-rid']){ return (r.ws.cbs[res.headers['ws-rid']]||function(){})(null, res) }
					//Gun.log("We have a pushed message!", res);
					if(res.body){ r.createServer.ing(res, function(){}) } // emit extra events.
				};
				ws.onerror = function(e){ Gun.log(e); };
				return true;
			}
			r.ws.peers = {};
			r.ws.cbs = {};
			r.jsonp = function(opt, cb){
				//Gun.log("jsonp send", opt);
				r.jsonp.ify(opt, function(url){
					//Gun.log(url);
					if(!url){ return }
					r.jsonp.send(url, function(reply){
						//Gun.log("jsonp reply", reply);
						cb(null, reply);
						r.jsonp.poll(opt, reply);
					}, opt.jsonp);
				});
			}
			r.jsonp.send = function(url, cb, id){
				var js = document.createElement('script');
				js.src = url;
				window[js.id = id] = function(res){
					cb(res);
					cb.id = js.id;
					js.parentNode.removeChild(js);
					window[cb.id] = null; // TODO: BUG: This needs to handle chunking!
					try{delete window[cb.id];
					}catch(e){}
				}
				js.async = true;
				document.getElementsByTagName('head')[0].appendChild(js);
				return js;
			}
			r.jsonp.poll = function(opt, res){
				if(!opt || !opt.base || !res || !res.headers || !res.headers.poll){ return }
				(r.jsonp.poll.s = r.jsonp.poll.s || {})[opt.base] = r.jsonp.poll.s[opt.base] || setTimeout(function(){ // TODO: Need to optimize for Chrome's 6 req limit?
					//Gun.log("polling again");
					var o = {base: opt.base, headers: {pull: 1}};
					r.each(opt.headers, function(v,i){ o.headers[i] = v })
					r.jsonp(o, function(err, reply){
						delete r.jsonp.poll.s[opt.base];
						while(reply.body && reply.body.length && reply.body.shift){ // we're assuming an array rather than chunk encoding. :(
							var res = reply.body.shift();
							//Gun.log("-- go go go", res);
							if(res && res.body){ r.createServer.ing(res, function(){}) } // emit extra events.
						}
					});
				}, res.headers.poll);
			}
			r.jsonp.ify = function(opt, cb){
				var uri = encodeURIComponent, q = '?';
				if(opt.url && opt.url.pathname){ q = opt.url.pathname + q; }
				q = opt.base + q;
				r.each((opt.url||{}).query, function(v, i){ q += uri(i) + '=' + uri(v) + '&' });
				if(opt.headers){ q += uri('`') + '=' + uri(JSON.stringify(opt.headers)) + '&' }
				if(r.jsonp.max < q.length){ return cb() }
				q += uri('jsonp') + '=' + uri(opt.jsonp = 'P'+Math.floor((Math.random()*65535)+1));
				if(opt.body){
					q += '&';
					var w = opt.body, wls = function(w,l,s){
						return uri('%') + '=' + uri(w+'-'+(l||w)+'/'+(s||w))  + '&' + uri('$') + '=';
					}
					if(typeof w != 'string'){
						w = JSON.stringify(w);
						q += uri('^') + '=' + uri('json') + '&';
					}
					w = uri(w);
					var i = 0, l = w.length
					, s = r.jsonp.max - (q.length + wls(l.toString()).length);
					if(s < 0){ return cb() }
					while(w){
						cb(q + wls(i, (i = i + s), l) + w.slice(0, i));
						w = w.slice(i);
					}
				} else {
					cb(q);
				}
			}
			r.jsonp.max = 2000;
			r.each = function(obj, cb){
				if(!obj || !cb){ return }
				for(var i in obj){
					if(obj.hasOwnProperty(i)){
						cb(obj[i], i);
					}
				}
			}
			return r;
		}());
	}({}));

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/

	/*
		creates peer objects
		and assigns event handlers
		to them.
	*/

	'use strict';
	var peers = __webpack_require__(5);
	var Gun = __webpack_require__(3);
	var SimplePeer = __webpack_require__(6);
	var view = __webpack_require__(39);
	var Stream = __webpack_require__(40);



	module.exports = function initiator(init, id, signal) {
		var peer = new SimplePeer({
			initiator: init,
			trickle: true
		});
		peer.on('connect', function () {
			view.connection();
			peers.online[id] = peer;
			window.peers = peers;
		});
		peer.on('signal', signal);
		peer.on('error', view.error);
		peer.on('close', function () {
			view.disconnect();
			peer.destroy();
			delete peers.online[id];
		});
		peer.on('data', function (req) {
			var event = 'request';
			if (req.response) {
				event = req.response;
			}
			Stream.emit(event, req, peer);
		});

		return peer;
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	/*jslint node: true*/
	'use strict';

	function PeerCollection() {}
	PeerCollection.prototype = {
		each: function (cb) {
			var peer;
			for (peer in this) {
				if (this.hasOwnProperty(peer)) {
					cb(this[peer], peer, this);
				}
			}
			return this;
		},

		broadcast: function (msg) {
			return this.each(function (peer) {
				peer.send(msg);
			});
		}
	};

	module.exports = {
		online: new PeerCollection()
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/* global Blob */

	module.exports = Peer

	var debug = __webpack_require__(11)('simple-peer')
	var getBrowserRTC = __webpack_require__(14)
	var hat = __webpack_require__(15)
	var inherits = __webpack_require__(16)
	var isTypedArray = __webpack_require__(17)
	var once = __webpack_require__(18)
	var stream = __webpack_require__(20)

	inherits(Peer, stream.Duplex)

	/**
	 * WebRTC peer connection. Same API as node core `net.Socket`, plus a few extra methods.
	 * Duplex stream.
	 * @param {Object} opts
	 */
	function Peer (opts) {
	  var self = this
	  if (!(self instanceof Peer)) return new Peer(opts)
	  self._debug('new peer %o', opts)

	  if (!opts) opts = {}
	  opts.allowHalfOpen = false
	  if (opts.highWaterMark == null) opts.highWaterMark = 1024 * 1024

	  stream.Duplex.call(self, opts)

	  self.initiator = opts.initiator || false
	  self.channelConfig = opts.channelConfig || Peer.channelConfig
	  self.channelName = opts.initiator ? (opts.channelName || hat(160)) : null
	  self.config = opts.config || Peer.config
	  self.constraints = opts.constraints || Peer.constraints
	  self.offerConstraints = opts.offerConstraints
	  self.answerConstraints = opts.answerConstraints
	  self.reconnectTimer = opts.reconnectTimer || false
	  self.sdpTransform = opts.sdpTransform || function (sdp) { return sdp }
	  self.stream = opts.stream || false
	  self.trickle = opts.trickle !== undefined ? opts.trickle : true

	  self.destroyed = false
	  self.connected = false

	  // so Peer object always has same shape (V8 optimization)
	  self.remoteAddress = undefined
	  self.remoteFamily = undefined
	  self.remotePort = undefined
	  self.localAddress = undefined
	  self.localPort = undefined

	  self._wrtc = opts.wrtc || getBrowserRTC()
	  if (!self._wrtc) {
	    if (typeof window === 'undefined') {
	      throw new Error('No WebRTC support: Specify `opts.wrtc` option in this environment')
	    } else {
	      throw new Error('No WebRTC support: Not a supported browser')
	    }
	  }

	  self._maxBufferedAmount = opts.highWaterMark
	  self._pcReady = false
	  self._channelReady = false
	  self._iceComplete = false // ice candidate trickle done (got null candidate)
	  self._channel = null
	  self._pendingCandidates = []

	  self._chunk = null
	  self._cb = null
	  self._interval = null
	  self._reconnectTimeout = null

	  self._pc = new (self._wrtc.RTCPeerConnection)(self.config, self.constraints)
	  self._pc.oniceconnectionstatechange = self._onIceConnectionStateChange.bind(self)
	  self._pc.onsignalingstatechange = self._onSignalingStateChange.bind(self)
	  self._pc.onicecandidate = self._onIceCandidate.bind(self)

	  if (self.stream) self._pc.addStream(self.stream)
	  self._pc.onaddstream = self._onAddStream.bind(self)

	  if (self.initiator) {
	    self._setupData({ channel: self._pc.createDataChannel(self.channelName, self.channelConfig) })
	    self._pc.onnegotiationneeded = once(self._createOffer.bind(self))
	    // Only Chrome triggers "negotiationneeded"; this is a workaround for other
	    // implementations
	    if (typeof window === 'undefined' || !window.webkitRTCPeerConnection) {
	      self._pc.onnegotiationneeded()
	    }
	  } else {
	    self._pc.ondatachannel = self._setupData.bind(self)
	  }

	  self.on('finish', function () {
	    if (self.connected) {
	      // When local peer is finished writing, close connection to remote peer.
	      // Half open connections are currently not supported.
	      // Wait a bit before destroying so the datachannel flushes.
	      // TODO: is there a more reliable way to accomplish this?
	      setTimeout(function () {
	        self._destroy()
	      }, 100)
	    } else {
	      // If data channel is not connected when local peer is finished writing, wait until
	      // data is flushed to network at "connect" event.
	      // TODO: is there a more reliable way to accomplish this?
	      self.once('connect', function () {
	        setTimeout(function () {
	          self._destroy()
	        }, 100)
	      })
	    }
	  })
	}

	Peer.WEBRTC_SUPPORT = !!getBrowserRTC()

	/**
	 * Expose config, constraints, and data channel config for overriding all Peer
	 * instances. Otherwise, just set opts.config, opts.constraints, or opts.channelConfig
	 * when constructing a Peer.
	 */
	Peer.config = {
	  iceServers: [
	    {
	      url: 'stun:23.21.150.121', // deprecated, replaced by `urls`
	      urls: 'stun:23.21.150.121'
	    }
	  ]
	}
	Peer.constraints = {}
	Peer.channelConfig = {}

	Object.defineProperty(Peer.prototype, 'bufferSize', {
	  get: function () {
	    var self = this
	    return (self._channel && self._channel.bufferedAmount) || 0
	  }
	})

	Peer.prototype.address = function () {
	  var self = this
	  return { port: self.localPort, family: 'IPv4', address: self.localAddress }
	}

	Peer.prototype.signal = function (data) {
	  var self = this
	  if (self.destroyed) throw new Error('cannot signal after peer is destroyed')
	  if (typeof data === 'string') {
	    try {
	      data = JSON.parse(data)
	    } catch (err) {
	      data = {}
	    }
	  }
	  self._debug('signal()')

	  function addIceCandidate (candidate) {
	    try {
	      self._pc.addIceCandidate(
	        new self._wrtc.RTCIceCandidate(candidate), noop, self._onError.bind(self)
	      )
	    } catch (err) {
	      self._destroy(new Error('error adding candidate: ' + err.message))
	    }
	  }

	  if (data.sdp) {
	    self._pc.setRemoteDescription(new (self._wrtc.RTCSessionDescription)(data), function () {
	      if (self.destroyed) return
	      if (self._pc.remoteDescription.type === 'offer') self._createAnswer()

	      self._pendingCandidates.forEach(addIceCandidate)
	      self._pendingCandidates = []
	    }, self._onError.bind(self))
	  }
	  if (data.candidate) {
	    if (self._pc.remoteDescription) addIceCandidate(data.candidate)
	    else self._pendingCandidates.push(data.candidate)
	  }
	  if (!data.sdp && !data.candidate) {
	    self._destroy(new Error('signal() called with invalid signal data'))
	  }
	}

	/**
	 * Send text/binary data to the remote peer.
	 * @param {TypedArrayView|ArrayBuffer|Buffer|string|Blob|Object} chunk
	 */
	Peer.prototype.send = function (chunk) {
	  var self = this

	  if (!isTypedArray.strict(chunk) && !(chunk instanceof ArrayBuffer) &&
	    !Buffer.isBuffer(chunk) && typeof chunk !== 'string' &&
	    (typeof Blob === 'undefined' || !(chunk instanceof Blob))) {
	    chunk = JSON.stringify(chunk)
	  }

	  // `wrtc` module doesn't accept node.js buffer
	  if (Buffer.isBuffer(chunk) && !isTypedArray.strict(chunk)) {
	    chunk = new Uint8Array(chunk)
	  }

	  var len = chunk.length || chunk.byteLength || chunk.size
	  self._channel.send(chunk)
	  self._debug('write: %d bytes', len)
	}

	Peer.prototype.destroy = function (onclose) {
	  var self = this
	  self._destroy(null, onclose)
	}

	Peer.prototype._destroy = function (err, onclose) {
	  var self = this
	  if (self.destroyed) return
	  if (onclose) self.once('close', onclose)

	  self._debug('destroy (error: %s)', err && err.message)

	  self.readable = self.writable = false

	  if (!self._readableState.ended) self.push(null)
	  if (!self._writableState.finished) self.end()

	  self.destroyed = true
	  self.connected = false
	  self._pcReady = false
	  self._channelReady = false

	  self._chunk = null
	  self._cb = null
	  clearInterval(self._interval)
	  clearTimeout(self._reconnectTimeout)

	  if (self._pc) {
	    try {
	      self._pc.close()
	    } catch (err) {}

	    self._pc.oniceconnectionstatechange = null
	    self._pc.onsignalingstatechange = null
	    self._pc.onicecandidate = null
	  }

	  if (self._channel) {
	    try {
	      self._channel.close()
	    } catch (err) {}

	    self._channel.onmessage = null
	    self._channel.onopen = null
	    self._channel.onclose = null
	  }
	  self._pc = null
	  self._channel = null

	  if (err) self.emit('error', err)
	  self.emit('close')
	}

	Peer.prototype._setupData = function (event) {
	  var self = this
	  self._channel = event.channel
	  self.channelName = self._channel.label

	  self._channel.binaryType = 'arraybuffer'
	  self._channel.onmessage = self._onChannelMessage.bind(self)
	  self._channel.onopen = self._onChannelOpen.bind(self)
	  self._channel.onclose = self._onChannelClose.bind(self)
	}

	Peer.prototype._read = function () {}

	Peer.prototype._write = function (chunk, encoding, cb) {
	  var self = this
	  if (self.destroyed) return cb(new Error('cannot write after peer is destroyed'))

	  if (self.connected) {
	    try {
	      self.send(chunk)
	    } catch (err) {
	      return self._onError(err)
	    }
	    if (self._channel.bufferedAmount > self._maxBufferedAmount) {
	      self._debug('start backpressure: bufferedAmount %d', self._channel.bufferedAmount)
	      self._cb = cb
	    } else {
	      cb(null)
	    }
	  } else {
	    self._debug('write before connect')
	    self._chunk = chunk
	    self._cb = cb
	  }
	}

	Peer.prototype._createOffer = function () {
	  var self = this
	  if (self.destroyed) return

	  self._pc.createOffer(function (offer) {
	    if (self.destroyed) return
	    offer.sdp = self.sdpTransform(offer.sdp)
	    self._pc.setLocalDescription(offer, noop, self._onError.bind(self))
	    var sendOffer = function () {
	      var signal = self._pc.localDescription || offer
	      self._debug('signal')
	      self.emit('signal', {
	        type: signal.type,
	        sdp: signal.sdp
	      })
	    }
	    if (self.trickle || self._iceComplete) sendOffer()
	    else self.once('_iceComplete', sendOffer) // wait for candidates
	  }, self._onError.bind(self), self.offerConstraints)
	}

	Peer.prototype._createAnswer = function () {
	  var self = this
	  if (self.destroyed) return

	  self._pc.createAnswer(function (answer) {
	    if (self.destroyed) return
	    answer.sdp = self.sdpTransform(answer.sdp)
	    self._pc.setLocalDescription(answer, noop, self._onError.bind(self))
	    var sendAnswer = function () {
	      var signal = self._pc.localDescription || answer
	      self._debug('signal')
	      self.emit('signal', {
	        type: signal.type,
	        sdp: signal.sdp
	      })
	    }
	    if (self.trickle || self._iceComplete) sendAnswer()
	    else self.once('_iceComplete', sendAnswer)
	  }, self._onError.bind(self), self.answerConstraints)
	}

	Peer.prototype._onIceConnectionStateChange = function () {
	  var self = this
	  if (self.destroyed) return
	  var iceGatheringState = self._pc.iceGatheringState
	  var iceConnectionState = self._pc.iceConnectionState
	  self._debug('iceConnectionStateChange %s %s', iceGatheringState, iceConnectionState)
	  self.emit('iceConnectionStateChange', iceGatheringState, iceConnectionState)
	  if (iceConnectionState === 'connected' || iceConnectionState === 'completed') {
	    clearTimeout(self._reconnectTimeout)
	    self._pcReady = true
	    self._maybeReady()
	  }
	  if (iceConnectionState === 'disconnected') {
	    if (self.reconnectTimer) {
	      // If user has set `opt.reconnectTimer`, allow time for ICE to attempt a reconnect
	      clearTimeout(self._reconnectTimeout)
	      self._reconnectTimeout = setTimeout(function () {
	        self._destroy()
	      }, self.reconnectTimer)
	    } else {
	      self._destroy()
	    }
	  }
	  if (iceConnectionState === 'failed') {
	    self._destroy()
	  }
	  if (iceConnectionState === 'closed') {
	    self._destroy()
	  }
	}

	Peer.prototype._maybeReady = function () {
	  var self = this
	  self._debug('maybeReady pc %s channel %s', self._pcReady, self._channelReady)
	  if (self.connected || self._connecting || !self._pcReady || !self._channelReady) return
	  self._connecting = true

	  if (!self._pc.getStats) {
	    onStats([])
	  } else if (typeof window !== 'undefined' && !!window.mozRTCPeerConnection) {
	    self._pc.getStats(null, function (res) {
	      var items = []
	      res.forEach(function (item) {
	        items.push(item)
	      })
	      onStats(items)
	    }, self._onError.bind(self))
	  } else {
	    self._pc.getStats(function (res) {
	      var items = []
	      res.result().forEach(function (result) {
	        var item = {}
	        result.names().forEach(function (name) {
	          item[name] = result.stat(name)
	        })
	        item.id = result.id
	        item.type = result.type
	        item.timestamp = result.timestamp
	        items.push(item)
	      })
	      onStats(items)
	    })
	  }

	  function onStats (items) {
	    items.forEach(function (item) {
	      if (item.type === 'remotecandidate' && item.candidateType === 'host') {
	        self.remoteAddress = item.ipAddress
	        self.remotePort = Number(item.portNumber)
	        self.remoteFamily = 'IPv4'
	        self._debug(
	          'connect remote: %s:%s (%s)',
	          self.remoteAddress, self.remotePort, self.remoteFamily
	        )
	      } else if (item.type === 'localcandidate' && item.candidateType === 'host') {
	        self.localAddress = item.ipAddress
	        self.localPort = Number(item.portNumber)
	        self._debug('connect local: %s:%s', self.localAddress, self.localPort)
	      }
	    })

	    self._connecting = false
	    self.connected = true

	    if (self._chunk) {
	      try {
	        self.send(self._chunk)
	      } catch (err) {
	        return self._onError(err)
	      }
	      self._chunk = null
	      self._debug('sent chunk from "write before connect"')

	      var cb = self._cb
	      self._cb = null
	      cb(null)
	    }

	    self._interval = setInterval(function () {
	      if (!self._cb || !self._channel || self._channel.bufferedAmount > self._maxBufferedAmount) return
	      self._debug('ending backpressure: bufferedAmount %d', self._channel.bufferedAmount)
	      var cb = self._cb
	      self._cb = null
	      cb(null)
	    }, 150)
	    if (self._interval.unref) self._interval.unref()

	    self._debug('connect')
	    self.emit('connect')
	  }
	}

	Peer.prototype._onSignalingStateChange = function () {
	  var self = this
	  if (self.destroyed) return
	  self._debug('signalingStateChange %s', self._pc.signalingState)
	  self.emit('signalingStateChange', self._pc.signalingState)
	}

	Peer.prototype._onIceCandidate = function (event) {
	  var self = this
	  if (self.destroyed) return
	  if (event.candidate && self.trickle) {
	    self.emit('signal', {
	      candidate: {
	        candidate: event.candidate.candidate,
	        sdpMLineIndex: event.candidate.sdpMLineIndex,
	        sdpMid: event.candidate.sdpMid
	      }
	    })
	  } else if (!event.candidate) {
	    self._iceComplete = true
	    self.emit('_iceComplete')
	  }
	}

	Peer.prototype._onChannelMessage = function (event) {
	  var self = this
	  if (self.destroyed) return
	  var data = event.data
	  self._debug('read: %d bytes', data.byteLength || data.length)

	  if (data instanceof ArrayBuffer) {
	    data = new Buffer(data)
	    self.push(data)
	  } else {
	    try {
	      data = JSON.parse(data)
	    } catch (err) {}
	    self.emit('data', data)
	  }
	}

	Peer.prototype._onChannelOpen = function () {
	  var self = this
	  if (self.connected || self.destroyed) return
	  self._debug('on channel open')
	  self._channelReady = true
	  self._maybeReady()
	}

	Peer.prototype._onChannelClose = function () {
	  var self = this
	  if (self.destroyed) return
	  self._debug('on channel close')
	  self._destroy()
	}

	Peer.prototype._onAddStream = function (event) {
	  var self = this
	  if (self.destroyed) return
	  self._debug('on add stream')
	  self.emit('stream', event.stream)
	}

	Peer.prototype._onError = function (err) {
	  var self = this
	  if (self.destroyed) return
	  self._debug('error %s', err.message || err)
	  self._destroy(err)
	}

	Peer.prototype._debug = function () {
	  var self = this
	  var args = [].slice.call(arguments)
	  var id = self.channelName && self.channelName.substring(0, 7)
	  args[0] = '[' + id + '] ' + args[0]
	  debug.apply(null, args)
	}

	function noop () {}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).Buffer))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(8)
	var ieee754 = __webpack_require__(9)
	var isArray = __webpack_require__(10)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).Buffer, (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 9 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {


	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(12);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}
	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {


	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(13);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 14 */
/***/ function(module, exports) {

	// originally pulled out of simple-peer

	module.exports = function getBrowserRTC () {
	  if (typeof window === 'undefined') return null
	  var wrtc = {
	    RTCPeerConnection: window.mozRTCPeerConnection || window.RTCPeerConnection ||
	      window.webkitRTCPeerConnection,
	    RTCSessionDescription: window.mozRTCSessionDescription ||
	      window.RTCSessionDescription || window.webkitRTCSessionDescription,
	    RTCIceCandidate: window.mozRTCIceCandidate || window.RTCIceCandidate ||
	      window.webkitRTCIceCandidate
	  }
	  if (!wrtc.RTCPeerConnection) return null
	  return wrtc
	}


/***/ },
/* 15 */
/***/ function(module, exports) {

	var hat = module.exports = function (bits, base) {
	    if (!base) base = 16;
	    if (bits === undefined) bits = 128;
	    if (bits <= 0) return '0';

	    var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
	    for (var i = 2; digits === Infinity; i *= 2) {
	        digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
	    }

	    var rem = digits - Math.floor(digits);

	    var res = '';

	    for (var i = 0; i < Math.floor(digits); i++) {
	        var x = Math.floor(Math.random() * base).toString(base);
	        res = x + res;
	    }

	    if (rem) {
	        var b = Math.pow(base, rem);
	        var x = Math.floor(Math.random() * b).toString(base);
	        res = x + res;
	    }

	    var parsed = parseInt(res, base);
	    if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
	        return hat(bits, base)
	    }
	    else return res;
	};

	hat.rack = function (bits, base, expandBy) {
	    var fn = function (data) {
	        var iters = 0;
	        do {
	            if (iters ++ > 10) {
	                if (expandBy) bits += expandBy;
	                else throw new Error('too many ID collisions, use more bits')
	            }

	            var id = hat(bits, base);
	        } while (Object.hasOwnProperty.call(hats, id));

	        hats[id] = data;
	        return id;
	    };
	    var hats = fn.hats = {};

	    fn.get = function (id) {
	        return fn.hats[id];
	    };

	    fn.set = function (id, value) {
	        fn.hats[id] = value;
	        return fn;
	    };

	    fn.bits = bits || 128;
	    fn.base = base || 16;
	    return fn;
	};


/***/ },
/* 16 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports      = isTypedArray
	isTypedArray.strict = isStrictTypedArray
	isTypedArray.loose  = isLooseTypedArray

	var toString = Object.prototype.toString
	var names = {
	    '[object Int8Array]': true
	  , '[object Int16Array]': true
	  , '[object Int32Array]': true
	  , '[object Uint8Array]': true
	  , '[object Uint8ClampedArray]': true
	  , '[object Uint16Array]': true
	  , '[object Uint32Array]': true
	  , '[object Float32Array]': true
	  , '[object Float64Array]': true
	}

	function isTypedArray(arr) {
	  return (
	       isStrictTypedArray(arr)
	    || isLooseTypedArray(arr)
	  )
	}

	function isStrictTypedArray(arr) {
	  return (
	       arr instanceof Int8Array
	    || arr instanceof Int16Array
	    || arr instanceof Int32Array
	    || arr instanceof Uint8Array
	    || arr instanceof Uint8ClampedArray
	    || arr instanceof Uint16Array
	    || arr instanceof Uint32Array
	    || arr instanceof Float32Array
	    || arr instanceof Float64Array
	  )
	}

	function isLooseTypedArray(arr) {
	  return names[toString.call(arr)]
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var wrappy = __webpack_require__(19)
	module.exports = wrappy(once)

	once.proto = once(function () {
	  Object.defineProperty(Function.prototype, 'once', {
	    value: function () {
	      return once(this)
	    },
	    configurable: true
	  })
	})

	function once (fn) {
	  var f = function () {
	    if (f.called) return f.value
	    f.called = true
	    return f.value = fn.apply(this, arguments)
	  }
	  f.called = false
	  return f
	}


/***/ },
/* 19 */
/***/ function(module, exports) {

	// Returns a wrapper function that returns a wrapped callback
	// The wrapper function should do some stuff, and return a
	// presumably different callback function.
	// This makes sure that own properties are retained, so that
	// decorations and such are not lost along the way.
	module.exports = wrappy
	function wrappy (fn, cb) {
	  if (fn && cb) return wrappy(fn)(cb)

	  if (typeof fn !== 'function')
	    throw new TypeError('need wrapper function')

	  Object.keys(fn).forEach(function (k) {
	    wrapper[k] = fn[k]
	  })

	  return wrapper

	  function wrapper() {
	    var args = new Array(arguments.length)
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i]
	    }
	    var ret = fn.apply(this, args)
	    var cb = args[args.length-1]
	    if (typeof ret === 'function' && ret !== cb) {
	      Object.keys(cb).forEach(function (k) {
	        ret[k] = cb[k]
	      })
	    }
	    return ret
	  }
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Stream;

	var EE = __webpack_require__(21).EventEmitter;
	var inherits = __webpack_require__(22);

	inherits(Stream, EE);
	Stream.Readable = __webpack_require__(23);
	Stream.Writable = __webpack_require__(35);
	Stream.Duplex = __webpack_require__(36);
	Stream.Transform = __webpack_require__(37);
	Stream.PassThrough = __webpack_require__(38);

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;



	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
	  EE.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
	  var source = this;

	  function ondata(chunk) {
	    if (dest.writable) {
	      if (false === dest.write(chunk) && source.pause) {
	        source.pause();
	      }
	    }
	  }

	  source.on('data', ondata);

	  function ondrain() {
	    if (source.readable && source.resume) {
	      source.resume();
	    }
	  }

	  dest.on('drain', ondrain);

	  // If the 'end' option is not supplied, dest.end() will be called when
	  // source gets the 'end' or 'close' events.  Only dest.end() once.
	  if (!dest._isStdio && (!options || options.end !== false)) {
	    source.on('end', onend);
	    source.on('close', onclose);
	  }

	  var didOnEnd = false;
	  function onend() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    dest.end();
	  }


	  function onclose() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    if (typeof dest.destroy === 'function') dest.destroy();
	  }

	  // don't leave dangling pipes when there are errors.
	  function onerror(er) {
	    cleanup();
	    if (EE.listenerCount(this, 'error') === 0) {
	      throw er; // Unhandled stream error in pipe.
	    }
	  }

	  source.on('error', onerror);
	  dest.on('error', onerror);

	  // remove all the event listeners that were added.
	  function cleanup() {
	    source.removeListener('data', ondata);
	    dest.removeListener('drain', ondrain);

	    source.removeListener('end', onend);
	    source.removeListener('close', onclose);

	    source.removeListener('error', onerror);
	    dest.removeListener('error', onerror);

	    source.removeListener('end', cleanup);
	    source.removeListener('close', cleanup);

	    dest.removeListener('close', cleanup);
	  }

	  source.on('end', cleanup);
	  source.on('close', cleanup);

	  dest.on('close', cleanup);

	  dest.emit('pipe', source);

	  // Allow for unix-like usage: A.pipe(B).pipe(C)
	  return dest;
	};


/***/ },
/* 21 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 22 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(24);
	exports.Stream = __webpack_require__(20);
	exports.Readable = exports;
	exports.Writable = __webpack_require__(31);
	exports.Duplex = __webpack_require__(30);
	exports.Transform = __webpack_require__(33);
	exports.PassThrough = __webpack_require__(34);


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Readable;

	/*<replacement>*/
	var isArray = __webpack_require__(26);
	/*</replacement>*/


	/*<replacement>*/
	var Buffer = __webpack_require__(7).Buffer;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	var EE = __webpack_require__(21).EventEmitter;

	/*<replacement>*/
	if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	var Stream = __webpack_require__(20);

	/*<replacement>*/
	var util = __webpack_require__(27);
	util.inherits = __webpack_require__(28);
	/*</replacement>*/

	var StringDecoder;


	/*<replacement>*/
	var debug = __webpack_require__(29);
	if (debug && debug.debuglog) {
	  debug = debug.debuglog('stream');
	} else {
	  debug = function () {};
	}
	/*</replacement>*/


	util.inherits(Readable, Stream);

	function ReadableState(options, stream) {
	  var Duplex = __webpack_require__(30);

	  options = options || {};

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.buffer = [];
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;


	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex)
	    this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // when piping, we only care about 'readable' events that happen
	  // after read()ing all the bytes and not getting any pushback.
	  this.ranOut = false;

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder)
	      StringDecoder = __webpack_require__(32).StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable(options) {
	  var Duplex = __webpack_require__(30);

	  if (!(this instanceof Readable))
	    return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  Stream.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function(chunk, encoding) {
	  var state = this._readableState;

	  if (util.isString(chunk) && !state.objectMode) {
	    encoding = encoding || state.defaultEncoding;
	    if (encoding !== state.encoding) {
	      chunk = new Buffer(chunk, encoding);
	      encoding = '';
	    }
	  }

	  return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function(chunk) {
	  var state = this._readableState;
	  return readableAddChunk(this, state, chunk, '', true);
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	  var er = chunkInvalid(state, chunk);
	  if (er) {
	    stream.emit('error', er);
	  } else if (util.isNullOrUndefined(chunk)) {
	    state.reading = false;
	    if (!state.ended)
	      onEofChunk(stream, state);
	  } else if (state.objectMode || chunk && chunk.length > 0) {
	    if (state.ended && !addToFront) {
	      var e = new Error('stream.push() after EOF');
	      stream.emit('error', e);
	    } else if (state.endEmitted && addToFront) {
	      var e = new Error('stream.unshift() after end event');
	      stream.emit('error', e);
	    } else {
	      if (state.decoder && !addToFront && !encoding)
	        chunk = state.decoder.write(chunk);

	      if (!addToFront)
	        state.reading = false;

	      // if we want the data now, just emit it.
	      if (state.flowing && state.length === 0 && !state.sync) {
	        stream.emit('data', chunk);
	        stream.read(0);
	      } else {
	        // update the buffer info.
	        state.length += state.objectMode ? 1 : chunk.length;
	        if (addToFront)
	          state.buffer.unshift(chunk);
	        else
	          state.buffer.push(chunk);

	        if (state.needReadable)
	          emitReadable(stream);
	      }

	      maybeReadMore(stream, state);
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	  }

	  return needMoreData(state);
	}



	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended &&
	         (state.needReadable ||
	          state.length < state.highWaterMark ||
	          state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function(enc) {
	  if (!StringDecoder)
	    StringDecoder = __webpack_require__(32).StringDecoder;
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 128MB
	var MAX_HWM = 0x800000;
	function roundUpToNextPowerOf2(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2
	    n--;
	    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
	    n++;
	  }
	  return n;
	}

	function howMuchToRead(n, state) {
	  if (state.length === 0 && state.ended)
	    return 0;

	  if (state.objectMode)
	    return n === 0 ? 0 : 1;

	  if (isNaN(n) || util.isNull(n)) {
	    // only flow one buffer at a time
	    if (state.flowing && state.buffer.length)
	      return state.buffer[0].length;
	    else
	      return state.length;
	  }

	  if (n <= 0)
	    return 0;

	  // If we're asking for more than the target buffer level,
	  // then raise the water mark.  Bump up to the next highest
	  // power of 2, to prevent increasing it excessively in tiny
	  // amounts.
	  if (n > state.highWaterMark)
	    state.highWaterMark = roundUpToNextPowerOf2(n);

	  // don't have that much.  return null, unless we've ended.
	  if (n > state.length) {
	    if (!state.ended) {
	      state.needReadable = true;
	      return 0;
	    } else
	      return state.length;
	  }

	  return n;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function(n) {
	  debug('read', n);
	  var state = this._readableState;
	  var nOrig = n;

	  if (!util.isNumber(n) || n > 0)
	    state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 &&
	      state.needReadable &&
	      (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended)
	      endReadable(this);
	    else
	      emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0)
	      endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  }

	  if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0)
	      state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	  }

	  // If _read pushed data synchronously, then `reading` will be false,
	  // and we need to re-evaluate how much data we can return to the user.
	  if (doRead && !state.reading)
	    n = howMuchToRead(nOrig, state);

	  var ret;
	  if (n > 0)
	    ret = fromList(n, state);
	  else
	    ret = null;

	  if (util.isNull(ret)) {
	    state.needReadable = true;
	    n = 0;
	  }

	  state.length -= n;

	  // If we have nothing in the buffer, then we want to know
	  // as soon as we *do* get something into the buffer.
	  if (state.length === 0 && !state.ended)
	    state.needReadable = true;

	  // If we tried to read() past the EOF, then emit end on the next tick.
	  if (nOrig !== n && state.ended && state.length === 0)
	    endReadable(this);

	  if (!util.isNull(ret))
	    this.emit('data', ret);

	  return ret;
	};

	function chunkInvalid(state, chunk) {
	  var er = null;
	  if (!util.isBuffer(chunk) &&
	      !util.isString(chunk) &&
	      !util.isNullOrUndefined(chunk) &&
	      !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}


	function onEofChunk(stream, state) {
	  if (state.decoder && !state.ended) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync)
	      process.nextTick(function() {
	        emitReadable_(stream);
	      });
	    else
	      emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}


	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    process.nextTick(function() {
	      maybeReadMore_(stream, state);
	    });
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended &&
	         state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;
	    else
	      len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function(n) {
	  this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function(dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
	              dest !== process.stdout &&
	              dest !== process.stderr;

	  var endFn = doEnd ? onend : cleanup;
	  if (state.endEmitted)
	    process.nextTick(endFn);
	  else
	    src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable) {
	    debug('onunpipe');
	    if (readable === src) {
	      cleanup();
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', cleanup);
	    src.removeListener('data', ondata);

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain &&
	        (!dest._writableState || dest._writableState.needDrain))
	      ondrain();
	  }

	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    var ret = dest.write(chunk);
	    if (false === ret) {
	      debug('false write response, pause',
	            src._readableState.awaitDrain);
	      src._readableState.awaitDrain++;
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EE.listenerCount(dest, 'error') === 0)
	      dest.emit('error', er);
	  }
	  // This is a brutally ugly hack to make sure that our error handler
	  // is attached before any userland ones.  NEVER DO THIS.
	  if (!dest._events || !dest._events.error)
	    dest.on('error', onerror);
	  else if (isArray(dest._events.error))
	    dest._events.error.unshift(onerror);
	  else
	    dest._events.error = [onerror, dest._events.error];



	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function() {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain)
	      state.awaitDrain--;
	    if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}


	Readable.prototype.unpipe = function(dest) {
	  var state = this._readableState;

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0)
	    return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes)
	      return this;

	    if (!dest)
	      dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest)
	      dest.emit('unpipe', this);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++)
	      dests[i].emit('unpipe', this);
	    return this;
	  }

	  // try to find the right one.
	  var i = indexOf(state.pipes, dest);
	  if (i === -1)
	    return this;

	  state.pipes.splice(i, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1)
	    state.pipes = state.pipes[0];

	  dest.emit('unpipe', this);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function(ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);

	  // If listening to data, and it has not explicitly been paused,
	  // then call resume to start the flow of data on the next tick.
	  if (ev === 'data' && false !== this._readableState.flowing) {
	    this.resume();
	  }

	  if (ev === 'readable' && this.readable) {
	    var state = this._readableState;
	    if (!state.readableListening) {
	      state.readableListening = true;
	      state.emittedReadable = false;
	      state.needReadable = true;
	      if (!state.reading) {
	        var self = this;
	        process.nextTick(function() {
	          debug('readable nexttick read 0');
	          self.read(0);
	        });
	      } else if (state.length) {
	        emitReadable(this, state);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function() {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    if (!state.reading) {
	      debug('resume read 0');
	      this.read(0);
	    }
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    process.nextTick(function() {
	      resume_(stream, state);
	    });
	  }
	}

	function resume_(stream, state) {
	  state.resumeScheduled = false;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading)
	    stream.read(0);
	}

	Readable.prototype.pause = function() {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  if (state.flowing) {
	    do {
	      var chunk = stream.read();
	    } while (null !== chunk && state.flowing);
	  }
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function(stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function() {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length)
	        self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function(chunk) {
	    debug('wrapped data');
	    if (state.decoder)
	      chunk = state.decoder.write(chunk);
	    if (!chunk || !state.objectMode && !chunk.length)
	      return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
	      this[i] = function(method) { return function() {
	        return stream[method].apply(stream, arguments);
	      }}(i);
	    }
	  }

	  // proxy certain important events.
	  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
	  forEach(events, function(ev) {
	    stream.on(ev, self.emit.bind(self, ev));
	  });

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function(n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};



	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	function fromList(n, state) {
	  var list = state.buffer;
	  var length = state.length;
	  var stringMode = !!state.decoder;
	  var objectMode = !!state.objectMode;
	  var ret;

	  // nothing in the list, definitely empty.
	  if (list.length === 0)
	    return null;

	  if (length === 0)
	    ret = null;
	  else if (objectMode)
	    ret = list.shift();
	  else if (!n || n >= length) {
	    // read it all, truncate the array.
	    if (stringMode)
	      ret = list.join('');
	    else
	      ret = Buffer.concat(list, length);
	    list.length = 0;
	  } else {
	    // read just some of it.
	    if (n < list[0].length) {
	      // just take a part of the first list item.
	      // slice is the same for buffers and strings.
	      var buf = list[0];
	      ret = buf.slice(0, n);
	      list[0] = buf.slice(n);
	    } else if (n === list[0].length) {
	      // first list is a perfect match
	      ret = list.shift();
	    } else {
	      // complex case.
	      // we have enough to cover it, but it spans past the first buffer.
	      if (stringMode)
	        ret = '';
	      else
	        ret = new Buffer(n);

	      var c = 0;
	      for (var i = 0, l = list.length; i < l && c < n; i++) {
	        var buf = list[0];
	        var cpy = Math.min(n - c, buf.length);

	        if (stringMode)
	          ret += buf.slice(0, cpy);
	        else
	          buf.copy(ret, c, 0, cpy);

	        if (cpy < buf.length)
	          list[0] = buf.slice(cpy);
	        else
	          list.shift();

	        c += cpy;
	      }
	    }
	  }

	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0)
	    throw new Error('endReadable called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    process.nextTick(function() {
	      // Check that we didn't get one last unshift.
	      if (!state.endEmitted && state.length === 0) {
	        state.endEmitted = true;
	        stream.readable = false;
	        stream.emit('end');
	      }
	    });
	  }
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf (xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(25)))

/***/ },
/* 25 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.

	function isArray(arg) {
	  if (Array.isArray) {
	    return Array.isArray(arg);
	  }
	  return objectToString(arg) === '[object Array]';
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = Buffer.isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).Buffer))

/***/ },
/* 28 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 29 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a duplex stream is just a stream that is both readable and writable.
	// Since JS doesn't have multiple prototypal inheritance, this class
	// prototypally inherits from Readable, and then parasitically from
	// Writable.

	module.exports = Duplex;

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	}
	/*</replacement>*/


	/*<replacement>*/
	var util = __webpack_require__(27);
	util.inherits = __webpack_require__(28);
	/*</replacement>*/

	var Readable = __webpack_require__(24);
	var Writable = __webpack_require__(31);

	util.inherits(Duplex, Readable);

	forEach(objectKeys(Writable.prototype), function(method) {
	  if (!Duplex.prototype[method])
	    Duplex.prototype[method] = Writable.prototype[method];
	});

	function Duplex(options) {
	  if (!(this instanceof Duplex))
	    return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false)
	    this.readable = false;

	  if (options && options.writable === false)
	    this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false)
	    this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended)
	    return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  process.nextTick(this.end.bind(this));
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(25)))

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, cb), and it'll handle all
	// the drain event emission and buffering.

	module.exports = Writable;

	/*<replacement>*/
	var Buffer = __webpack_require__(7).Buffer;
	/*</replacement>*/

	Writable.WritableState = WritableState;


	/*<replacement>*/
	var util = __webpack_require__(27);
	util.inherits = __webpack_require__(28);
	/*</replacement>*/

	var Stream = __webpack_require__(20);

	util.inherits(Writable, Stream);

	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	}

	function WritableState(options, stream) {
	  var Duplex = __webpack_require__(30);

	  options = options || {};

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex)
	    this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function(er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.buffer = [];

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;
	}

	function Writable(options) {
	  var Duplex = __webpack_require__(30);

	  // Writable ctor is applied to Duplexes, though they're not
	  // instanceof Writable, they're instanceof Readable.
	  if (!(this instanceof Writable) && !(this instanceof Duplex))
	    return new Writable(options);

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function() {
	  this.emit('error', new Error('Cannot pipe. Not readable.'));
	};


	function writeAfterEnd(stream, state, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  process.nextTick(function() {
	    cb(er);
	  });
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  if (!util.isBuffer(chunk) &&
	      !util.isString(chunk) &&
	      !util.isNullOrUndefined(chunk) &&
	      !state.objectMode) {
	    var er = new TypeError('Invalid non-string/buffer chunk');
	    stream.emit('error', er);
	    process.nextTick(function() {
	      cb(er);
	    });
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function(chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  if (util.isFunction(encoding)) {
	    cb = encoding;
	    encoding = null;
	  }

	  if (util.isBuffer(chunk))
	    encoding = 'buffer';
	  else if (!encoding)
	    encoding = state.defaultEncoding;

	  if (!util.isFunction(cb))
	    cb = function() {};

	  if (state.ended)
	    writeAfterEnd(this, state, cb);
	  else if (validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function() {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function() {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing &&
	        !state.corked &&
	        !state.finished &&
	        !state.bufferProcessing &&
	        state.buffer.length)
	      clearBuffer(this, state);
	  }
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode &&
	      state.decodeStrings !== false &&
	      util.isString(chunk)) {
	    chunk = new Buffer(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	  chunk = decodeChunk(state, chunk, encoding);
	  if (util.isBuffer(chunk))
	    encoding = 'buffer';
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret)
	    state.needDrain = true;

	  if (state.writing || state.corked)
	    state.buffer.push(new WriteReq(chunk, encoding, cb));
	  else
	    doWrite(stream, state, false, len, chunk, encoding, cb);

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev)
	    stream._writev(chunk, state.onwrite);
	  else
	    stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  if (sync)
	    process.nextTick(function() {
	      state.pendingcb--;
	      cb(er);
	    });
	  else {
	    state.pendingcb--;
	    cb(er);
	  }

	  stream._writableState.errorEmitted = true;
	  stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er)
	    onwriteError(stream, state, sync, er, cb);
	  else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(stream, state);

	    if (!finished &&
	        !state.corked &&
	        !state.bufferProcessing &&
	        state.buffer.length) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      process.nextTick(function() {
	        afterWrite(stream, state, finished, cb);
	      });
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished)
	    onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}


	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;

	  if (stream._writev && state.buffer.length > 1) {
	    // Fast case, write everything using _writev()
	    var cbs = [];
	    for (var c = 0; c < state.buffer.length; c++)
	      cbs.push(state.buffer[c].callback);

	    // count the one we are adding, as well.
	    // TODO(isaacs) clean this up
	    state.pendingcb++;
	    doWrite(stream, state, true, state.length, state.buffer, '', function(err) {
	      for (var i = 0; i < cbs.length; i++) {
	        state.pendingcb--;
	        cbs[i](err);
	      }
	    });

	    // Clear buffer
	    state.buffer = [];
	  } else {
	    // Slow case, write chunks one-by-one
	    for (var c = 0; c < state.buffer.length; c++) {
	      var entry = state.buffer[c];
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);

	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        c++;
	        break;
	      }
	    }

	    if (c < state.buffer.length)
	      state.buffer = state.buffer.slice(c);
	    else
	      state.buffer.length = 0;
	  }

	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function(chunk, encoding, cb) {
	  cb(new Error('not implemented'));

	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function(chunk, encoding, cb) {
	  var state = this._writableState;

	  if (util.isFunction(chunk)) {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (util.isFunction(encoding)) {
	    cb = encoding;
	    encoding = null;
	  }

	  if (!util.isNullOrUndefined(chunk))
	    this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished)
	    endWritable(this, state, cb);
	};


	function needFinish(stream, state) {
	  return (state.ending &&
	          state.length === 0 &&
	          !state.finished &&
	          !state.writing);
	}

	function prefinish(stream, state) {
	  if (!state.prefinished) {
	    state.prefinished = true;
	    stream.emit('prefinish');
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(stream, state);
	  if (need) {
	    if (state.pendingcb === 0) {
	      prefinish(stream, state);
	      state.finished = true;
	      stream.emit('finish');
	    } else
	      prefinish(stream, state);
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished)
	      process.nextTick(cb);
	    else
	      stream.once('finish', cb);
	  }
	  state.ended = true;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(25)))

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var Buffer = __webpack_require__(7).Buffer;

	var isBufferEncoding = Buffer.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     }


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	var StringDecoder = exports.StringDecoder = function(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	};


	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer.length;

	    // add the new bytes to the char buffer
	    buffer.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer = buffer.slice(available, buffer.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer);

	  var end = buffer.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer.length >= 3) ? 3 : buffer.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer[buffer.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer) {
	  var res = '';
	  if (buffer && buffer.length)
	    res = this.write(buffer);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer) {
	  return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	module.exports = Transform;

	var Duplex = __webpack_require__(30);

	/*<replacement>*/
	var util = __webpack_require__(27);
	util.inherits = __webpack_require__(28);
	/*</replacement>*/

	util.inherits(Transform, Duplex);


	function TransformState(options, stream) {
	  this.afterTransform = function(er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb)
	    return stream.emit('error', new Error('no writecb in Transform class'));

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (!util.isNullOrUndefined(data))
	    stream.push(data);

	  if (cb)
	    cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}


	function Transform(options) {
	  if (!(this instanceof Transform))
	    return new Transform(options);

	  Duplex.call(this, options);

	  this._transformState = new TransformState(options, this);

	  // when the writable side finishes, then flush out anything remaining.
	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  this.once('prefinish', function() {
	    if (util.isFunction(this._flush))
	      this._flush(function(er) {
	        done(stream, er);
	      });
	    else
	      done(stream);
	  });
	}

	Transform.prototype.push = function(chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function(chunk, encoding, cb) {
	  throw new Error('not implemented');
	};

	Transform.prototype._write = function(chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform ||
	        rs.needReadable ||
	        rs.length < rs.highWaterMark)
	      this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function(n) {
	  var ts = this._transformState;

	  if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};


	function done(stream, er) {
	  if (er)
	    return stream.emit('error', er);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var ts = stream._transformState;

	  if (ws.length)
	    throw new Error('calling transform done when ws.length != 0');

	  if (ts.transforming)
	    throw new Error('calling transform done when still transforming');

	  return stream.push(null);
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a passthrough stream.
	// basically just the most minimal sort of Transform stream.
	// Every written chunk gets output as-is.

	module.exports = PassThrough;

	var Transform = __webpack_require__(33);

	/*<replacement>*/
	var util = __webpack_require__(27);
	util.inherits = __webpack_require__(28);
	/*</replacement>*/

	util.inherits(PassThrough, Transform);

	function PassThrough(options) {
	  if (!(this instanceof PassThrough))
	    return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function(chunk, encoding, cb) {
	  cb(null, chunk);
	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(31)


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(30)


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(33)


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(34)


/***/ },
/* 39 */
/***/ function(module, exports) {

	/*jslint node: true*/
	'use strict';
	var view;

	function $(query) {
		return document.querySelector(query);
	}

	module.exports = view = {
		h1: $('h1'),

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
		}
	};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/*global module*/

	var Stream;

	(function () {
		'use strict';

		var streams = [];

		function array(obj) {
			return Array.prototype.slice.call(obj);
		}

		function callbacks(args) {
			return array(args).filter(function (cb) {
				return typeof cb === 'function';
			});
		}

		function events(args) {
			return array(args).filter(function (event) {
				return typeof event === 'string';
			});
		}

		Stream = function () {
			if (!(this instanceof Stream)) {
				return new Stream();
			}
			this.events = {};
			streams.push(this);
		};

		Stream.prototype = {
			constructor: Stream,
			on: function () {
				var cbs, names, stream = this;
				cbs = callbacks(arguments);
				names = events(arguments);

				names.forEach(function (event) {
					cbs.forEach(function (cb) {
						if (!stream.events[event]) {
							stream.events[event] = [];
						}
						stream.events[event].push(cb);
					});
				});

				return this;
			},

			emit: function (event) {
				if (!event) {
					return this;
				}
				var args = array(arguments).slice(1);
				if (!this.events[event]) {
					return this;
				}
				this.events[event].forEach(function (cb) {
					cb.apply(null, args);
				});

				return this;
			},

			bind: function () {
				var names, stream = this;
				names = events(arguments);

				return function () {
					var args = array(arguments);

					names.forEach(function (event) {
						stream.emit.apply(stream, [event].concat(args));
					});

					return names.length;
				};
			}

		};

		Stream.emit = function (event) {
			var args = array(arguments);
			streams.forEach(function (stream) {
				stream.emit.apply(stream, args);
			});
			return streams.length;
		};

		if (true) {
			module.exports = Stream;
		}

	}());


/***/ },
/* 41 */
/***/ function(module, exports) {

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


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/
	var initiator = __webpack_require__(4);
	var filter = __webpack_require__(41);
	var Gun = __webpack_require__(3);

	module.exports = function listen(peers, myself) {
	  'use strict';

	  // each request object
	  peers.path(myself).map().val(function (v, key) {
	    var peer, invalid, requests = this;

	    if (key === 'id') {
	      return;
	    }

			function handleSignal(signal) {
	      var SDO = JSON.stringify(signal);
	      filter(SDO);
	      requests.path(Gun.text.random(10)).put(SDO);
	    }

	    // create a peer instance
	    peer = initiator(false, key, handleSignal);

	    // each session description object
	    requests.map().val(function (SDO, key) {
				if (typeof SDO === 'object') {
					return;
				}
	      if (key === 'id' || filter(SDO)) {
	        return;
	      }

				var signal = JSON.parse(SDO);

				// don't signal if the connection is closed
				if (!peer.destroyed) {
					peer.signal(signal);
				}

	    });
	  });

	};


/***/ },
/* 43 */
/***/ function(module, exports) {

	/*jslint node: true*/
	module.exports = 'gx904egpMe7bl1ggaPVv:';


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/
	var Gun = __webpack_require__(3);

	// local data interface
	window.local = module.exports = {
		db: new Gun({
			rtc: false
		}),

		ID: Gun.text.random()
	};


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';
	var Gun = __webpack_require__(3);
	var local = __webpack_require__(44);
	var peers = __webpack_require__(5);
	var Stream = __webpack_require__(40);
	var stream = new Stream();

	stream.on('request', function (req, peer) {
		local.db.__.opt.wire.get(req.value, function (err, node) {
			if (peer.connected) {
				if (err) {
					return peer.send(err);
				}
				peer.send({
					value: node,
					response: req.ID
				});
			}
		});
	});

	module.exports = function (query, cb, opt) {
		var requestID = Gun.text.random(20);

		local.db.__.opt.wire.get(query, cb, opt);

		stream.on(requestID, function (data) {
			if (data.err) {
				return cb(data.err);
			}
			cb(null, data.value);

			// when calling `.put`, the raw `.get` driver responds
			// with more data causing it to infinitely recurse.
			// support options for server stuns.
		});

		peers.online.broadcast({
			value: query,
			ID: requestID
		});
	};


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/
	'use strict';
	var Gun = __webpack_require__(3);
	var local = __webpack_require__(44);

	module.exports = function (graph, cb, opt) {
		Gun.is.graph(graph, function (node, soul) {
			local.db.put(node, cb).key(soul);
		});
	};


/***/ }
/******/ ]);
