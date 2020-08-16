(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('electron')) :
	typeof define === 'function' && define.amd ? define(['exports', 'electron'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.evwt = {}, global.electron));
}(this, (function (exports, electron) { 'use strict';

	function createCommonjsModule(fn, basedir, module) {
		return module = {
		  path: basedir,
		  exports: {},
		  require: function (path, base) {
	      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
	    }
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var observableSlim = createCommonjsModule(function (module) {
	/*
	 * 	Observable Slim
	 *	Version 0.1.5
	 * 	https://github.com/elliotnb/observable-slim
	 *
	 * 	Licensed under the MIT license:
	 * 	http://www.opensource.org/licenses/MIT
	 *
	 *	Observable Slim is a singleton that allows you to observe changes made to an object and any nested
	 *	children of that object. It is intended to assist with one-way data binding, that is, in MVC parlance,
	 *	reflecting changes in the model to the view. Observable Slim aspires to be as lightweight and easily
	 *	understood as possible. Minifies down to roughly 3000 characters.
	 */
	var ObservableSlim = (function() {
		// An array that stores all of the observables created through the public create() method below.
		var observables = [];
		// An array of all the objects that we have assigned Proxies to
		var targets = [];

		// An array of arrays containing the Proxies created for each target object. targetsProxy is index-matched with
		// 'targets' -- together, the pair offer a Hash table where the key is not a string nor number, but the actual target object
		var targetsProxy = [];

		// this variable tracks duplicate proxies assigned to the same target.
		// the 'set' handler below will trigger the same change on all other Proxies tracking the same target.
		// however, in order to avoid an infinite loop of Proxies triggering and re-triggering one another, we use dupProxy
		// to track that a given Proxy was modified from the 'set' handler
		var dupProxy = null;

		var _getProperty = function(obj, path) {
			return path.split('.').reduce(function(prev, curr) {
				return prev ? prev[curr] : undefined
			}, obj || self)
		};

		/*	Function: _create
					Private internal function that is invoked to create a new ES6 Proxy whose changes we can observe through
					the Observerable.observe() method.

				Parameters:
					target 				- required, plain JavaScript object that we want to observe for changes.
					domDelay 			- batch up changes on a 10ms delay so a series of changes can be processed in one DOM update.
					originalObservable 	- object, the original observable created by the user, exists for recursion purposes,
										  allows one observable to observe change on any nested/child objects.
					originalPath 		- array of objects, each object having the properties 'target' and 'property' -- target referring to the observed object itself
										  and property referring to the name of that object in the nested structure. the path of the property in relation to the target 
										  on the original observable, exists for recursion purposes, allows one observable to observe change on any nested/child objects. 

				Returns:
					An ES6 Proxy object.
		*/
		var _create = function(target, domDelay, originalObservable, originalPath) {

			var observable = originalObservable || null;
			
			// record the nested path taken to access this object -- if there was no path then we provide the first empty entry
			var path = originalPath || [{"target":target,"property":""}];
			
			// in order to accurately report the "previous value" of the "length" property on an Array
			// we must use a helper property because intercepting a length change is not always possible as of 8/13/2018 in 
			// Chrome -- the new `length` value is already set by the time the `set` handler is invoked
			if (target instanceof Array) target.__length = target.length;
			
			var changes = [];

			/*	Function: _getPath
					Returns a string of the nested path (in relation to the top-level observed object)
					of the property being modified or deleted.
				Parameters:
					target - the object whose property is being modified or deleted.
					property - the string name of the property
					jsonPointer - optional, set to true if the string path should be formatted as a JSON pointer.

				Returns:
					String of the nested path (e.g., hello.testing.1.bar or, if JSON pointer, /hello/testing/1/bar
			*/
			var _getPath = function(target, property, jsonPointer) {
			
				var fullPath = "";
				var lastTarget = null;
				
				// loop over each item in the path and append it to full path
				for (var i = 0; i < path.length; i++) {
					
					// if the current object was a member of an array, it's possible that the array was at one point
					// mutated and would cause the position of the current object in that array to change. we perform an indexOf
					// lookup here to determine the current position of that object in the array before we add it to fullPath
					if (lastTarget instanceof Array && !isNaN(path[i].property)) {
						path[i].property = lastTarget.indexOf(path[i].target);
					}
					
					fullPath = fullPath + "." + path[i].property;
					lastTarget = path[i].target;
				}
				
				// add the current property
				fullPath = fullPath + "." + property;
				
				// remove the beginning two dots -- ..foo.bar becomes foo.bar (the first item in the nested chain doesn't have a property name)
				fullPath = fullPath.substring(2);
				
				if (jsonPointer === true) fullPath = "/" + fullPath.replace(/\./g, "/");

				return fullPath;
			};

			var _notifyObservers = function(numChanges) {

				// if the observable is paused, then we don't want to execute any of the observer functions
				if (observable.paused === true) return;

				// execute observer functions on a 10ms settimeout, this prevents the observer functions from being executed
				// separately on every change -- this is necessary because the observer functions will often trigger UI updates
	 			if (domDelay === true) {
					setTimeout(function() {
						if (numChanges === changes.length) {

							// we create a copy of changes before passing it to the observer functions because even if the observer function
							// throws an error, we still need to ensure that changes is reset to an empty array so that old changes don't persist
							var changesCopy = changes.slice(0);
							changes = [];

							// invoke any functions that are observing changes
							for (var i = 0; i < observable.observers.length; i++) observable.observers[i](changesCopy);

						}
					},10);
				} else {

					// we create a copy of changes before passing it to the observer functions because even if the observer function
					// throws an error, we still need to ensure that changes is reset to an empty array so that old changes don't persist
					var changesCopy = changes.slice(0);
					changes = [];

					// invoke any functions that are observing changes
					for (var i = 0; i < observable.observers.length; i++) observable.observers[i](changesCopy);

				}
			};

			var handler = {
				get: function(target, property) {

					// implement a simple check for whether or not the object is a proxy, this helps the .create() method avoid
					// creating Proxies of Proxies.
					if (property === "__getTarget") {
						return target;
					} else if (property === "__isProxy") {
						return true;
					// from the perspective of a given observable on a parent object, return the parent object of the given nested object
					} else if (property === "__getParent") {
						return function(i) {
							if (typeof i === "undefined") var i = 1;
							var parentPath = _getPath(target, "__getParent").split(".");
							parentPath.splice(-(i+1),(i+1));
							return _getProperty(observable.parentProxy, parentPath.join("."));
						}
					} else if (property === "__getPath") {
						var parentPath = _getPath(target, "__getParent");
						return parentPath.slice(0, -12);
					}

					// for performance improvements, we assign this to a variable so we do not have to lookup the property value again
					var targetProp = target[property];
					if (target instanceof Date && targetProp instanceof Function && targetProp !== null) {
						return targetProp.bind(target);
					}

					// if we are traversing into a new object, then we want to record path to that object and return a new observable.
					// recursively returning a new observable allows us a single Observable.observe() to monitor all changes on
					// the target object and any objects nested within.
					if (targetProp instanceof Object && targetProp !== null && target.hasOwnProperty(property)) {

						// if we've found a proxy nested on the object, then we want to retrieve the original object behind that proxy
						if (targetProp.__isProxy === true) targetProp = targetProp.__getTarget;
						
						// if the object accessed by the user (targetProp) already has a __targetPosition AND the object
						// stored at target[targetProp.__targetPosition] is not null, then that means we are already observing this object
						// we might be able to return a proxy that we've already created for the object
						if (targetProp.__targetPosition > -1 && targets[targetProp.__targetPosition] !== null) {
							
							// loop over the proxies that we've created for this object
							var ttp = targetsProxy[targetProp.__targetPosition];
							for (var i = 0, l = ttp.length; i < l; i++) {
								
								// if we find a proxy that was setup for this particular observable, then return that proxy
								if (observable === ttp[i].observable) {
									return ttp[i].proxy;
								}
							}
						}

						// if we're arrived here, then that means there is no proxy for the object the user just accessed, so we
						// have to create a new proxy for it

						// create a shallow copy of the path array -- if we didn't create a shallow copy then all nested objects would share the same path array and the path wouldn't be accurate
						var newPath = path.slice(0);
						newPath.push({"target":targetProp,"property":property});
						return _create(targetProp, domDelay, observable, newPath);
					} else {
						return targetProp;
					}
				},
	 			deleteProperty: function(target, property) {

					// was this change an original change or was it a change that was re-triggered below
					var originalChange = true;
					if (dupProxy === proxy) {
						originalChange = false;
						dupProxy = null;
					}

					// in order to report what the previous value was, we must make a copy of it before it is deleted
					var previousValue = Object.assign({}, target);

					// record the deletion that just took place
					changes.push({
						"type":"delete"
						,"target":target
						,"property":property
						,"newValue":null
						,"previousValue":previousValue[property]
						,"currentPath":_getPath(target, property)
						,"jsonPointer":_getPath(target, property, true)
						,"proxy":proxy
					});

					if (originalChange === true) {

						// perform the delete that we've trapped if changes are not paused for this observable
						if (!observable.changesPaused) delete target[property];
					
						for (var a = 0, l = targets.length; a < l; a++) if (target === targets[a]) break;

						// loop over each proxy and see if the target for this change has any other proxies
						var currentTargetProxy = targetsProxy[a] || [];

						var b = currentTargetProxy.length;
						while (b--) {
							// if the same target has a different proxy
							if (currentTargetProxy[b].proxy !== proxy) {
								// !!IMPORTANT!! store the proxy as a duplicate proxy (dupProxy) -- this will adjust the behavior above appropriately (that is,
								// prevent a change on dupProxy from re-triggering the same change on other proxies)
								dupProxy = currentTargetProxy[b].proxy;

								// make the same delete on the different proxy for the same target object. it is important that we make this change *after* we invoke the same change
								// on any other proxies so that the previousValue can show up correct for the other proxies
								delete currentTargetProxy[b].proxy[property];
							}
						}

					}

					_notifyObservers(changes.length);

					return true;

				},
				set: function(target, property, value, receiver) {
					
					// if the value we're assigning is an object, then we want to ensure
					// that we're assigning the original object, not the proxy, in order to avoid mixing
					// the actual targets and proxies -- creates issues with path logging if we don't do this
					if (value && value.__isProxy) value = value.__getTarget;
				
					// was this change an original change or was it a change that was re-triggered below
					var originalChange = true;
					if (dupProxy === proxy) {
						originalChange = false;
						dupProxy = null;
					}

					// improve performance by saving direct references to the property
					var targetProp = target[property];

					// Only record this change if:
					// 	1. the new value differs from the old one 
					//	2. OR if this proxy was not the original proxy to receive the change
					// 	3. OR the modified target is an array and the modified property is "length" and our helper property __length indicates that the array length has changed
					//
					// Regarding #3 above: mutations of arrays via .push or .splice actually modify the .length before the set handler is invoked
					// so in order to accurately report the correct previousValue for the .length, we have to use a helper property.
					if (targetProp !== value || originalChange === false || (property === "length" && target instanceof Array && target.__length !== value)) {

						var foundObservable = true;

						var typeOfTargetProp = (typeof targetProp);

						// determine if we're adding something new or modifying somethat that already existed
						var type = "update";
						if (typeOfTargetProp === "undefined") type = "add";

						// store the change that just occurred. it is important that we store the change before invoking the other proxies so that the previousValue is correct
						changes.push({
							"type":type
							,"target":target
							,"property":property
							,"newValue":value
							,"previousValue":receiver[property]
							,"currentPath":_getPath(target, property)
							,"jsonPointer":_getPath(target, property, true)
							,"proxy":proxy
						});
						
						// mutations of arrays via .push or .splice actually modify the .length before the set handler is invoked
						// so in order to accurately report the correct previousValue for the .length, we have to use a helper property.
						if (property === "length" && target instanceof Array && target.__length !== value) {
							changes[changes.length-1].previousValue = target.__length;
							target.__length = value;
						}

						// !!IMPORTANT!! if this proxy was the first proxy to receive the change, then we need to go check and see
						// if there are other proxies for the same project. if there are, then we will modify those proxies as well so the other
						// observers can be modified of the change that has occurred.
						if (originalChange === true) {

							// because the value actually differs than the previous value
							// we need to store the new value on the original target object,
							// but only as long as changes have not been paused
							if (!observable.changesPaused) target[property] = value;


							foundObservable = false;
							
							var targetPosition = target.__targetPosition;
							var z = targetsProxy[targetPosition].length;
							
							// find the parent target for this observable -- if the target for that observable has not been removed
							// from the targets array, then that means the observable is still active and we should notify the observers of this change
							while (z--) {
								if (observable === targetsProxy[targetPosition][z].observable) {
									if (targets[targetsProxy[targetPosition][z].observable.parentTarget.__targetPosition] !== null) {
										foundObservable = true;
										break;
									}
								}
							}

							// if we didn't find an observable for this proxy, then that means .remove(proxy) was likely invoked
							// so we no longer need to notify any observer function about the changes, but we still need to update the
							// value of the underlying original objectm see below: target[property] = value;
							if (foundObservable) {

								// loop over each proxy and see if the target for this change has any other proxies
								var currentTargetProxy = targetsProxy[targetPosition];
								for (var b = 0, l = currentTargetProxy.length; b < l; b++) {
									// if the same target has a different proxy
									if (currentTargetProxy[b].proxy !== proxy) {

										// !!IMPORTANT!! store the proxy as a duplicate proxy (dupProxy) -- this will adjust the behavior above appropriately (that is,
										// prevent a change on dupProxy from re-triggering the same change on other proxies)
										dupProxy = currentTargetProxy[b].proxy;

										// invoke the same change on the different proxy for the same target object. it is important that we make this change *after* we invoke the same change
										// on any other proxies so that the previousValue can show up correct for the other proxies
										currentTargetProxy[b].proxy[property] = value;

									}
								}

								// if the property being overwritten is an object, then that means this observable
								// will need to stop monitoring this object and any nested objects underneath the overwritten object else they'll become
								// orphaned and grow memory usage. we excute this on a setTimeout so that the clean-up process does not block
								// the UI rendering -- there's no need to execute the clean up immediately
								setTimeout(function() {
									
									if (typeOfTargetProp === "object" && targetProp !== null) {

										// check if the to-be-overwritten target property still exists on the target object
										// if it does still exist on the object, then we don't want to stop observing it. this resolves
										// an issue where array .sort() triggers objects to be overwritten, but instead of being overwritten
										// and discarded, they are shuffled to a new position in the array
										var keys = Object.keys(target);
										for (var i = 0, l = keys.length; i < l; i++) {
											if (target[keys[i]] === targetProp) return;
										}
										
										var stillExists = false;
										
										// now we perform the more expensive search recursively through the target object.
										// if we find the targetProp (that was just overwritten) still exists somewhere else
										// further down in the object, then we still need to observe the targetProp on this observable.
										(function iterate(target) {
											var keys = Object.keys(target);
											for (var i = 0, l = keys.length; i < l; i++) {
												
												var property = keys[i];
												var nestedTarget = target[property];
												
												if (nestedTarget instanceof Object && nestedTarget !== null) iterate(nestedTarget);
												if (nestedTarget === targetProp) {
													stillExists = true;
													return;
												}
											}									})(target);
										
										// even though targetProp was overwritten, if it still exists somewhere else on the object,
										// then we don't want to remove the observable for that object (targetProp)
										if (stillExists === true) return;

										// loop over each property and recursively invoke the `iterate` function for any
										// objects nested on targetProp
										(function iterate(obj) {

											var keys = Object.keys(obj);
											for (var i = 0, l = keys.length; i < l; i++) {
												var objProp = obj[keys[i]];
												if (objProp instanceof Object && objProp !== null) iterate(objProp);
											}

											// if there are any existing target objects (objects that we're already observing)...
											var c = -1;
											for (var i = 0, l = targets.length; i < l; i++) {
												if (obj === targets[i]) {
													c = i;
													break;
												}
											}
											if (c > -1) {

												// ...then we want to determine if the observables for that object match our current observable
												var currentTargetProxy = targetsProxy[c];
												var d = currentTargetProxy.length;

												while (d--) {
													// if we do have an observable monitoring the object thats about to be overwritten
													// then we can remove that observable from the target object
													if (observable === currentTargetProxy[d].observable) {
														currentTargetProxy.splice(d,1);
														break;
													}
												}

												// if there are no more observables assigned to the target object, then we can remove
												// the target object altogether. this is necessary to prevent growing memory consumption particularly with large data sets
												if (currentTargetProxy.length == 0) {
													// targetsProxy.splice(c,1);
													targets[c] = null;
												}
											}

										})(targetProp);
									}
								},10000);
							}

							// TO DO: the next block of code resolves test case #29, but it results in poor IE11 performance with very large objects.
							// UPDATE: need to re-evaluate IE11 performance due to major performance overhaul from 12/23/2018.
							// 
							// if the value we've just set is an object, then we'll need to iterate over it in order to initialize the
							// observers/proxies on all nested children of the object
							/* if (value instanceof Object && value !== null) {
								(function iterate(proxy) {
									var target = proxy.__getTarget;
									var keys = Object.keys(target);
									for (var i = 0, l = keys.length; i < l; i++) {
										var property = keys[i];
										if (target[property] instanceof Object && target[property] !== null) iterate(proxy[property]);
									};
								})(proxy[property]);
							}; */

						}
						if (foundObservable) {
							// notify the observer functions that the target has been modified
							_notifyObservers(changes.length);
						}

					}
					return true;
				}
			};

			var __targetPosition = target.__targetPosition;
			if (!(__targetPosition > -1)) {
				Object.defineProperty(target, "__targetPosition", {
					value: targets.length
					,writable: false
					,enumerable: false
					,configurable: false
				});
			}
			
			// create the proxy that we'll use to observe any changes
			var proxy = new Proxy(target, handler);

			// we don't want to create a new observable if this function was invoked recursively
			if (observable === null) {
				observable = {"parentTarget":target, "domDelay":domDelay, "parentProxy":proxy, "observers":[],"paused":false,"path":path,"changesPaused":false};
				observables.push(observable);
			}

			// store the proxy we've created so it isn't re-created unnecessairly via get handler
			var proxyItem = {"target":target,"proxy":proxy,"observable":observable};

			// if we have already created a Proxy for this target object then we add it to the corresponding array
			// on targetsProxy (targets and targetsProxy work together as a Hash table indexed by the actual target object).
			if (__targetPosition > -1) {
				
				// the targets array is set to null for the position of this particular object, then we know that
				// the observable was removed some point in time for this object -- so we need to set the reference again
				if (targets[__targetPosition] === null) {
					targets[__targetPosition] = target;
				}
				
				targetsProxy[__targetPosition].push(proxyItem);
				
			// else this is a target object that we had not yet created a Proxy for, so we must add it to targets,
			// and push a new array on to targetsProxy containing the new Proxy
			} else {
				targets.push(target);
				targetsProxy.push([proxyItem]);
			}

			return proxy;
		};

		return {
			/*	Method:
					Public method that is invoked to create a new ES6 Proxy whose changes we can observe
					through the Observerable.observe() method.

				Parameters
					target - Object, required, plain JavaScript object that we want to observe for changes.
					domDelay - Boolean, required, if true, then batch up changes on a 10ms delay so a series of changes can be processed in one DOM update.
					observer - Function, optional, will be invoked when a change is made to the proxy.

				Returns:
					An ES6 Proxy object.
			*/
			create: function(target, domDelay, observer) {

				// test if the target is a Proxy, if it is then we need to retrieve the original object behind the Proxy.
				// we do not allow creating proxies of proxies because -- given the recursive design of ObservableSlim -- it would lead to sharp increases in memory usage
				if (target.__isProxy === true) {
					var target = target.__getTarget;
					//if it is, then we should throw an error. we do not allow creating proxies of proxies
					// because -- given the recursive design of ObservableSlim -- it would lead to sharp increases in memory usage
					//throw new Error("ObservableSlim.create() cannot create a Proxy for a target object that is also a Proxy.");
				}

				// fire off the _create() method -- it will create a new observable and proxy and return the proxy
				var proxy = _create(target, domDelay);

				// assign the observer function
				if (typeof observer === "function") this.observe(proxy, observer);

				// recursively loop over all nested objects on the proxy we've just created
				// this will allow the top observable to observe any changes that occur on a nested object
				(function iterate(proxy) {
					var target = proxy.__getTarget;
					var keys  = Object.keys(target);
					for (var i = 0, l = keys.length; i < l; i++) {
						var property = keys[i];
						if (target[property] instanceof Object && target[property] !== null) iterate(proxy[property]);
					}
				})(proxy);

				return proxy;

			},

			/*	Method: observe
					This method is used to add a new observer function to an existing proxy.

				Parameters:
					proxy 	- the ES6 Proxy returned by the create() method. We want to observe changes made to this object.
					observer 	- this function will be invoked when a change is made to the observable (not to be confused with the
								  observer defined in the create() method).

				Returns:
					Nothing.
			*/
			observe: function(proxy, observer) {
				// loop over all the observables created by the _create() function
				var i = observables.length;
				while (i--) {
					if (observables[i].parentProxy === proxy) {
						observables[i].observers.push(observer);
						break;
					}
				}		},

			/*	Method: pause
					This method will prevent any observer functions from being invoked when a change occurs to a proxy.

				Parameters:
					proxy 	- the ES6 Proxy returned by the create() method.
			*/
			pause: function(proxy) {
				var i = observables.length;
				var foundMatch = false;
				while (i--) {
					if (observables[i].parentProxy === proxy) {
						observables[i].paused = true;
						foundMatch = true;
						break;
					}
				}
				if (foundMatch == false) throw new Error("ObseravableSlim could not pause observable -- matching proxy not found.");
			},

			/*	Method: resume
					This method will resume execution of any observer functions when a change is made to a proxy.

				Parameters:
					proxy 	- the ES6 Proxy returned by the create() method.
			*/
			resume: function(proxy) {
				var i = observables.length;
				var foundMatch = false;
				while (i--) {
					if (observables[i].parentProxy === proxy) {
						observables[i].paused = false;
						foundMatch = true;
						break;
					}
				}
				if (foundMatch == false) throw new Error("ObseravableSlim could not resume observable -- matching proxy not found.");
			},

			/*	Method: pauseChanges
					This method will prevent any changes (i.e., set, and deleteProperty) from being written to the target
					object.  However, the observer functions will still be invoked to let you know what changes WOULD have
					been made.  This can be useful if the changes need to be approved by an external source before the
					changes take effect.

				Parameters:
					proxy	- the ES6 Proxy returned by the create() method.
			 */
			pauseChanges: function(proxy){
				var i = observables.length;
				var foundMatch = false;
				while (i--) {
					if (observables[i].parentProxy === proxy) {
						observables[i].changesPaused = true;
						foundMatch = true;
						break;
					}
				}
				if (foundMatch == false) throw new Error("ObseravableSlim could not pause changes on observable -- matching proxy not found.");
			},

			/*	Method: resumeChanges
					This method will resume the changes that were taking place prior to the call to pauseChanges().

				Parameters:
					proxy	- the ES6 Proxy returned by the create() method.
			 */
			resumeChanges: function(proxy){
				var i = observables.length;
				var foundMatch = false;
				while (i--) {
					if (observables[i].parentProxy === proxy) {
						observables[i].changesPaused = false;
						foundMatch = true;
						break;
					}
				}
				if (foundMatch == false) throw new Error("ObseravableSlim could not resume changes on observable -- matching proxy not found.");
			},

			/*	Method: remove
					This method will remove the observable and proxy thereby preventing any further callback observers for
					changes occuring to the target object.

				Parameters:
					proxy 	- the ES6 Proxy returned by the create() method.
			*/
			remove: function(proxy) {

				var matchedObservable = null;
				var foundMatch = false;
				
				var c = observables.length;
				while (c--) {
					if (observables[c].parentProxy === proxy) {
						matchedObservable = observables[c];
						foundMatch = true;
						break;
					}
				}
				var a = targetsProxy.length;
				while (a--) {
					var b = targetsProxy[a].length;
					while (b--) {
						if (targetsProxy[a][b].observable === matchedObservable) {
							targetsProxy[a].splice(b,1);
							
							// if there are no more proxies for this target object
							// then we null out the position for this object on the targets array
							// since we are essentially no longer observing this object.
							// we do not splice it off the targets array, because if we re-observe the same 
							// object at a later time, the property __targetPosition cannot be redefined.
							if (targetsProxy[a].length === 0) {
								targets[a] = null;
							}					}
					}			}
				if (foundMatch === true) {
					observables.splice(c,1);
				}
			}
		};
	})();

	// Export in a try catch to prevent this from erroring out on older browsers
	try { module.exports = ObservableSlim; } catch (err) {}});

	const EvContextMenu = {};

	/**
	 * Build context menu from a menu definition
	 *
	 * @param {Object} menu
	 */
	function build(menu) {
	  this.$emit('build', menu);
	}

	/**
	 * Show context menu
	 *
	 * @param {String} id
	 */
	function show(id) {
	  this.$emit('show', id);
	}

	/**
	 * Get context menu
	 *
	 * @param {String} menuId
	 */
	function get(menuId) {
	  return this.menus[menuId];
	}

	/**
	 * Get context menu item
	 *
	 * @param {String} menuId
	 * @param {String} itemId
	 */
	function getItem(menuId, itemId) {
	  return this.findMenuItemDeep(this.menus[menuId], itemId);
	}

	/**
	 * Listen to events on the context menu
	 *
	 * @param {String} eventName - Event name e.g. `evcontextmenu:my-context-menu:item-1`
	 * @param {Function} callback - (menuItem) => {}
	 */
	function on(event, cb) {
	  this.$on(event, cb);
	}

	EvContextMenu.install = function (Vue) {
	  let menuVm = new Vue({
	    data() {
	      return {
	        menus: {},
	        isDirty: {}
	      };
	    },

	    created() {
	      this.handleBuild();
	      this.handleShow();
	      this.handleNativeInput();
	    },

	    methods: {
	      getItem,
	      on,
	      build,
	      show,
	      get,

	      // We are using ObservableSlim because Vue watchers have a limitation [1]
	      // where the old and new values are the same for mutations of
	      // objects, so there's no way to tell which menu changed, and
	      // therefore no way to know which input event to send.
	      //
	      // [1] See the note here https://vuejs.org/v2/api/#vm-watch
	      //
	      createObservableMenuItem(menuItem, id) {
	        return observableSlim.create(menuItem, false, async (changes) => {
	          for (const change of changes) {
	            if (change.type === 'update') {
	              if (change.newValue === change.previousValue) continue;
	              if (!change.target.id) continue;

	              let item = change.target;

	              await electron.ipcRenderer.invoke('evcontextmenu:emit', { item, id });
	              this.$emit(`input:${id}`, item);
	              this.$emit(`input:${id}:${item.id}`, item);
	            }
	          }
	        });
	      },

	      handleBuild() {
	        this.$on('build', async ({ id, menu }) => {
	          await electron.ipcRenderer.invoke('evcontextmenu:set', { id, menu });

	          // We use a proxy here to watch for new items added to the menu
	          // dynamically and make them observable, just like the initial items
	          let menuItems = new Proxy([], {
	            set: (obj, key, value) => {
	              // If we're dealing with an array index (i.e. not the length property)
	              if (!Number.isNaN(parseInt(key))) {
	                // Make the new menu item observable like the initial ones
	                return Reflect.set(obj, key, this.createObservableMenuItem(value, id));
	              }

	              return Reflect.set(obj, key, value);
	            }
	          });

	          // Build observable menu items so we can send changes to the background
	          for (const menuItem of menu) {
	            let observableMenuItem = this.createObservableMenuItem(menuItem, id);
	            menuItems.push(observableMenuItem);
	          }

	          // Add to our collection of all context menus
	          // so that we can refer to them when e.g. the
	          // user calls .get(id)
	          this.$set(this.menus, id, menuItems);

	          // Watch for changes and send IPC events to background
	          this.$watch(() => this.menus[id], m => this.syncMenu(m, id), { deep: true });
	        });
	      },

	      async syncMenu(menu, id) {
	        // Turns out JSON.stringify is the best way to serialize something.
	        // In this case we're removing all the observer/proxy stuff from the
	        // object so it can be sent over IPC
	        let serializedNewMenu = JSON.parse(JSON.stringify(menu));
	        await electron.ipcRenderer.invoke('evcontextmenu:set', { id, menu: serializedNewMenu });
	      },

	      handleShow() {
	        this.$on('show', async id => electron.ipcRenderer.invoke('evcontextmenu:show', id));
	      },

	      handleNativeInput() {
	        electron.ipcRenderer.on('evcontextmenu:ipc:input', (e, { id, item }) => {
	          let menu = this.menus[id];
	          if (!menu) return;

	          let menuItem = this.getItem(id, item.id);

	          // Apply properties from the event onto our reactive data
	          for (let key of Object.keys(menuItem)) {
	            this.$set(menuItem, key, item[key]);
	          }
	        });
	      },

	      findMenuItemDeep(items, id) {
	        if (!items) { return; }

	        for (let item of items) {
	          if (item.id === id) return item;

	          if (item.submenu) {
	            let found = this.findMenuItemDeep(item.submenu, id);
	            if (found) return found;
	          }
	        }
	      }
	    }
	  });

	  Vue.prototype.$evcontextmenu = menuVm;
	};

	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//

	var script = {
	  name: 'EvDropZone',

	  props: {
	    // Border radius of overlay
	    radius: {
	      type: Number,
	      default: 10
	    },
	    // Color of overlay border
	    stroke: {
	      type: String,
	      default: '#ccc'
	    },
	    // Width of overlay border
	    strokeWidth: {
	      type: Number,
	      default: 10
	    },
	    // Dash array spacing
	    strokeDashArray: {
	      type: String,
	      default: '10, 20'
	    },
	    // Dash offset
	    strokeDashOffset: {
	      type: Number,
	      default: 35
	    }
	  },

	  data() {
	    return {
	      entered: false
	    };
	  },

	  computed: {
	    frameStyle() {
	      return `border-radius: ${this.radius}px`;
	    }
	  },

	  methods: {
	    handleDrop(ev) {
	      this.entered = false;

	      let files = [];
	      let items = ev.dataTransfer.items;

	      if (items && items.length) {
	        for (let i = 0; i < items.length; i++) {
	          if (items[i].kind === 'file') {
	            let file = items[i].getAsFile();
	            files.push(file);
	          }
	        }

	        // Emits array of Files when one or more files are dropped
	        // @arg Array of https://developer.mozilla.org/en-US/docs/Web/API/File
	        this.$emit('drop', files);
	      }
	    }
	  }
	};

	function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
	    if (typeof shadowMode !== 'boolean') {
	        createInjectorSSR = createInjector;
	        createInjector = shadowMode;
	        shadowMode = false;
	    }
	    // Vue.extend constructor export interop.
	    const options = typeof script === 'function' ? script.options : script;
	    // render functions
	    if (template && template.render) {
	        options.render = template.render;
	        options.staticRenderFns = template.staticRenderFns;
	        options._compiled = true;
	        // functional template
	        if (isFunctionalTemplate) {
	            options.functional = true;
	        }
	    }
	    // scopedId
	    if (scopeId) {
	        options._scopeId = scopeId;
	    }
	    let hook;
	    if (moduleIdentifier) {
	        // server build
	        hook = function (context) {
	            // 2.3 injection
	            context =
	                context || // cached call
	                    (this.$vnode && this.$vnode.ssrContext) || // stateful
	                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
	            // 2.2 with runInNewContext: true
	            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
	                context = __VUE_SSR_CONTEXT__;
	            }
	            // inject component styles
	            if (style) {
	                style.call(this, createInjectorSSR(context));
	            }
	            // register component module identifier for async chunk inference
	            if (context && context._registeredComponents) {
	                context._registeredComponents.add(moduleIdentifier);
	            }
	        };
	        // used by ssr in case component is cached and beforeCreate
	        // never gets called
	        options._ssrRegister = hook;
	    }
	    else if (style) {
	        hook = shadowMode
	            ? function (context) {
	                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
	            }
	            : function (context) {
	                style.call(this, createInjector(context));
	            };
	    }
	    if (hook) {
	        if (options.functional) {
	            // register for functional component in vue file
	            const originalRender = options.render;
	            options.render = function renderWithStyleInjection(h, context) {
	                hook.call(context);
	                return originalRender(h, context);
	            };
	        }
	        else {
	            // inject component registration as beforeCreate hook
	            const existing = options.beforeCreate;
	            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
	        }
	    }
	    return script;
	}

	const isOldIE = typeof navigator !== 'undefined' &&
	    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
	function createInjector(context) {
	    return (id, style) => addStyle(id, style);
	}
	let HEAD;
	const styles = {};
	function addStyle(id, css) {
	    const group = isOldIE ? css.media || 'default' : id;
	    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
	    if (!style.ids.has(id)) {
	        style.ids.add(id);
	        let code = css.source;
	        if (css.map) {
	            // https://developer.chrome.com/devtools/docs/javascript-debugging
	            // this makes source maps inside style tags work properly in Chrome
	            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
	            // http://stackoverflow.com/a/26603875
	            code +=
	                '\n/*# sourceMappingURL=data:application/json;base64,' +
	                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
	                    ' */';
	        }
	        if (!style.element) {
	            style.element = document.createElement('style');
	            style.element.type = 'text/css';
	            if (css.media)
	                style.element.setAttribute('media', css.media);
	            if (HEAD === undefined) {
	                HEAD = document.head || document.getElementsByTagName('head')[0];
	            }
	            HEAD.appendChild(style.element);
	        }
	        if ('styleSheet' in style.element) {
	            style.styles.push(code);
	            style.element.styleSheet.cssText = style.styles
	                .filter(Boolean)
	                .join('\n');
	        }
	        else {
	            const index = style.ids.size - 1;
	            const textNode = document.createTextNode(code);
	            const nodes = style.element.childNodes;
	            if (nodes[index])
	                style.element.removeChild(nodes[index]);
	            if (nodes.length)
	                style.element.insertBefore(textNode, nodes[index]);
	            else
	                style.element.appendChild(textNode);
	        }
	    }
	}

	/* script */
	const __vue_script__ = script;

	/* template */
	var __vue_render__ = function() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c(
	    "div",
	    {
	      staticClass: "ev-drop-zone",
	      on: {
	        drop: function($event) {
	          $event.stopPropagation();
	          return _vm.handleDrop($event)
	        },
	        dragenter: function($event) {
	          _vm.entered = true;
	        },
	        dragover: function($event) {
	          $event.preventDefault();
	          $event.stopPropagation();
	          _vm.entered = true;
	        },
	        dragleave: function($event) {
	          _vm.entered = false;
	        }
	      }
	    },
	    [
	      _c(
	        "svg",
	        {
	          directives: [
	            {
	              name: "show",
	              rawName: "v-show",
	              value: _vm.entered,
	              expression: "entered"
	            }
	          ],
	          staticClass: "ev-drop-zone-frame",
	          style: _vm.frameStyle
	        },
	        [
	          _c("rect", {
	            attrs: {
	              width: "100%",
	              height: "100%",
	              fill: "none",
	              rx: _vm.radius,
	              ry: _vm.radius,
	              stroke: _vm.stroke,
	              "stroke-width": _vm.strokeWidth,
	              "stroke-dasharray": _vm.strokeDashArray,
	              "stroke-dashoffset": _vm.strokeDashOffset,
	              "stroke-linecap": "square"
	            }
	          })
	        ]
	      ),
	      _vm._v(" "),
	      _vm._t("default")
	    ],
	    2
	  )
	};
	var __vue_staticRenderFns__ = [];
	__vue_render__._withStripped = true;

	  /* style */
	  const __vue_inject_styles__ = function (inject) {
	    if (!inject) return
	    inject("data-v-f9b2bb70_0", { source: ".ev-drop-zone-frame[data-v-f9b2bb70] {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  pointer-events: none;\n  z-index: 1;\n}\n.ev-drop-zone[data-v-f9b2bb70] {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n/*# sourceMappingURL=EvDropZone.vue.map */", map: {"version":3,"sources":["/Users/john/Code/evwt/packages/EvDropZone/src/EvDropZone.vue","EvDropZone.vue"],"names":[],"mappings":"AA8FA;EACA,kBAAA;EACA,WAAA;EACA,YAAA;EACA,sBAAA;EACA,MAAA;EACA,SAAA;EACA,OAAA;EACA,QAAA;EACA,oBAAA;EACA,UAAA;AC7FA;ADgGA;EACA,kBAAA;EACA,WAAA;EACA,YAAA;AC7FA;;AAEA,yCAAyC","file":"EvDropZone.vue","sourcesContent":["<template>\n  <div\n    class=\"ev-drop-zone\"\n    @drop.stop=\"handleDrop\"\n    @dragenter=\"entered = true\"\n    @dragover.prevent.stop=\"entered = true\"\n    @dragleave=\"entered = false\">\n    <svg v-show=\"entered\" class=\"ev-drop-zone-frame\" :style=\"frameStyle\">\n      <rect\n        width=\"100%\"\n        height=\"100%\"\n        fill=\"none\"\n        :rx=\"radius\"\n        :ry=\"radius\"\n        :stroke=\"stroke\"\n        :stroke-width=\"strokeWidth\"\n        :stroke-dasharray=\"strokeDashArray\"\n        :stroke-dashoffset=\"strokeDashOffset\"\n        stroke-linecap=\"square\" />\n    </svg>\n    <!-- Component to wrap -->\n    <slot />\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'EvDropZone',\n\n  props: {\n    // Border radius of overlay\n    radius: {\n      type: Number,\n      default: 10\n    },\n    // Color of overlay border\n    stroke: {\n      type: String,\n      default: '#ccc'\n    },\n    // Width of overlay border\n    strokeWidth: {\n      type: Number,\n      default: 10\n    },\n    // Dash array spacing\n    strokeDashArray: {\n      type: String,\n      default: '10, 20'\n    },\n    // Dash offset\n    strokeDashOffset: {\n      type: Number,\n      default: 35\n    }\n  },\n\n  data() {\n    return {\n      entered: false\n    };\n  },\n\n  computed: {\n    frameStyle() {\n      return `border-radius: ${this.radius}px`;\n    }\n  },\n\n  methods: {\n    handleDrop(ev) {\n      this.entered = false;\n\n      let files = [];\n      let items = ev.dataTransfer.items;\n\n      if (items && items.length) {\n        for (let i = 0; i < items.length; i++) {\n          if (items[i].kind === 'file') {\n            let file = items[i].getAsFile();\n            files.push(file);\n          }\n        }\n\n        // Emits array of Files when one or more files are dropped\n        // @arg Array of https://developer.mozilla.org/en-US/docs/Web/API/File\n        this.$emit('drop', files);\n      }\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n.ev-drop-zone-frame {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.ev-drop-zone {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n</style>\n",".ev-drop-zone-frame {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.ev-drop-zone {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n/*# sourceMappingURL=EvDropZone.vue.map */"]}, media: undefined });

	  };
	  /* scoped */
	  const __vue_scope_id__ = "data-v-f9b2bb70";
	  /* module identifier */
	  const __vue_module_identifier__ = undefined;
	  /* functional template */
	  const __vue_is_functional_template__ = false;
	  /* style inject SSR */
	  
	  /* style inject shadow dom */
	  

	  
	  const __vue_component__ = /*#__PURE__*/normalizeComponent(
	    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
	    __vue_inject_styles__,
	    __vue_script__,
	    __vue_scope_id__,
	    __vue_is_functional_template__,
	    __vue_module_identifier__,
	    false,
	    createInjector,
	    undefined,
	    undefined
	  );

	__vue_component__.install = function(Vue) {
	  Vue.component(__vue_component__.name, __vue_component__);
	};

	//
	//
	//
	//
	//
	//

	var script$1 = {
	  props: {
	    // The filename of the icon without the .svg extension
	    name: {
	      type: String,
	      required: true
	    }
	  }
	};

	/* script */
	const __vue_script__$1 = script$1;

	/* template */
	var __vue_render__$1 = function() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c(
	    "div",
	    { staticClass: "ev-icon", class: "ev-icon-" + _vm.name },
	    [_c("ev-icon-" + _vm.name, { tag: "component" })],
	    1
	  )
	};
	var __vue_staticRenderFns__$1 = [];
	__vue_render__$1._withStripped = true;

	  /* style */
	  const __vue_inject_styles__$1 = function (inject) {
	    if (!inject) return
	    inject("data-v-0668d986_0", { source: "*[data-v-0668d986] {\n  box-sizing: border-box;\n}\n*[data-v-0668d986]:before,\n*[data-v-0668d986]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-0668d986] {\n  height: 100%;\n}\n.vh-100[data-v-0668d986] {\n  height: 100vh;\n}\n.w-100[data-v-0668d986] {\n  width: 100%;\n}\n.vw-100[data-v-0668d986] {\n  width: 100vw;\n}\n.pre-line[data-v-0668d986] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-0668d986] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-0668d986] {\n  white-space: nowrap;\n}\n.d-block[data-v-0668d986] {\n  display: block;\n}\n.d-inline-block[data-v-0668d986] {\n  display: inline-block;\n}\n.d-flex[data-v-0668d986] {\n  display: flex;\n}\n.d-inline-flex[data-v-0668d986] {\n  display: inline-flex;\n}\n.d-grid[data-v-0668d986] {\n  display: grid;\n}\n.d-none[data-v-0668d986] {\n  display: none;\n}\n.hide[data-v-0668d986] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-0668d986] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-0668d986] {\n  overflow: auto;\n}\n.flex-center[data-v-0668d986] {\n  justify-content: center;\n}\n.flex-middle[data-v-0668d986] {\n  align-items: center;\n}\n.flex-grow[data-v-0668d986] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-0668d986] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-0668d986] {\n  flex-direction: column;\n}\n.flex-space[data-v-0668d986] {\n  justify-content: space-between;\n}\n.flex-end[data-v-0668d986] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-0668d986] {\n  justify-content: flex-start;\n}\n.text-center[data-v-0668d986] {\n  text-align: center;\n}\n.m-z[data-v-0668d986] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-0668d986] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-0668d986] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-0668d986] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-0668d986] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-0668d986] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-0668d986] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-0668d986] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-0668d986] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-0668d986] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-0668d986] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-0668d986] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-0668d986] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-0668d986] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-0668d986] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-0668d986] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-0668d986] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-0668d986] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-0668d986] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-0668d986] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-0668d986] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-0668d986] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-0668d986] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-0668d986] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-0668d986] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-0668d986] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-0668d986] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-0668d986] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-0668d986] {\n  margin-left: 2px;\n}\n.p-z[data-v-0668d986] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-0668d986] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-0668d986] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-0668d986] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-0668d986] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-0668d986] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-0668d986] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-0668d986] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-0668d986] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-0668d986] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-0668d986] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-0668d986] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-0668d986] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-0668d986] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-0668d986] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-0668d986] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-0668d986] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-0668d986] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-0668d986] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-0668d986] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-0668d986] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-0668d986] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-0668d986] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-0668d986] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-0668d986] {\n  padding-left: 5px;\n}\n.p-xs[data-v-0668d986] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-0668d986] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-0668d986] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-0668d986] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-0668d986] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-0668d986] {\n  padding: 2px;\n}\n.p-xs[data-v-0668d986] {\n  padding: 5px;\n}\n.p-sm[data-v-0668d986] {\n  padding: 10px;\n}\n.p-med[data-v-0668d986] {\n  padding: 15px;\n}\n.p-lg[data-v-0668d986] {\n  padding: 20px;\n}\n.p-xl[data-v-0668d986] {\n  padding: 25px;\n}\n.m-xxs[data-v-0668d986] {\n  margin: 2px;\n}\n.m-xs[data-v-0668d986] {\n  margin: 5px;\n}\n.m-sm[data-v-0668d986] {\n  margin: 10px;\n}\n.m-med[data-v-0668d986] {\n  margin: 15px;\n}\n.m-lg[data-v-0668d986] {\n  margin: 20px;\n}\n.m-xl[data-v-0668d986] {\n  margin: 25px;\n}\nsvg[data-v-0668d986] {\n  width: auto;\n  height: 100%;\n}\n\n/*# sourceMappingURL=EvIcon.vue.map */", map: {"version":3,"sources":["EvIcon.vue","/Users/john/Code/evwt/packages/EvIcon/src/EvIcon.vue"],"names":[],"mappings":"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","file":"EvIcon.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\nsvg {\n  width: auto;\n  height: 100%;\n}\n\n/*# sourceMappingURL=EvIcon.vue.map */","<template>\n  <div class=\"ev-icon\" :class=\"`ev-icon-${name}`\">\n    <component :is=\"`ev-icon-${name}`\" />\n  </div>\n</template>\n\n<script>\nexport default {\n  props: {\n    // The filename of the icon without the .svg extension\n    name: {\n      type: String,\n      required: true\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '@/../style/reset.scss';\n@import '@/../style/utilities.scss';\n\nsvg {\n  width: auto;\n  height: 100%;\n}\n</style>\n"]}, media: undefined });

	  };
	  /* scoped */
	  const __vue_scope_id__$1 = "data-v-0668d986";
	  /* module identifier */
	  const __vue_module_identifier__$1 = undefined;
	  /* functional template */
	  const __vue_is_functional_template__$1 = false;
	  /* style inject SSR */
	  
	  /* style inject shadow dom */
	  

	  
	  const __vue_component__$1 = /*#__PURE__*/normalizeComponent(
	    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
	    __vue_inject_styles__$1,
	    __vue_script__$1,
	    __vue_scope_id__$1,
	    __vue_is_functional_template__$1,
	    __vue_module_identifier__$1,
	    false,
	    createInjector,
	    undefined,
	    undefined
	  );

	__vue_component__$1.install = function(Vue) {
	  Vue.component(__vue_component__$1.name, __vue_component__$1);
	};

	const numeric = (value, unit) => Number(value.slice(0, -1 * unit.length));

	const parseValue = value => {
	  if (value.endsWith('px')) { return { value, type: 'px', numeric: numeric(value, 'px') }; }
	  if (value.endsWith('fr')) { return { value, type: 'fr', numeric: numeric(value, 'fr') }; }
	  if (value.endsWith('%')) { return { value, type: '%', numeric: numeric(value, '%') }; }
	  if (value === 'auto') return { value, type: 'auto' };
	  return null;
	};

	const parse = rule => rule.split(' ').map(parseValue);

	const getSizeAtTrack = (index, tracks, gap = 0, end = false) => {
	  const newIndex = end ? index + 1 : index;
	  const trackSum = tracks
	    .slice(0, newIndex)
	    .reduce((accum, value) => accum + value.numeric, 0);
	  const gapSum = gap ? index * gap : 0;

	  return trackSum + gapSum;
	};

	const getStyles = (rule, ownRules, matchedRules) =>
	    [...ownRules, ...matchedRules]
	        .map(r => r.style[rule])
	        .filter(style => style !== undefined && style !== '');

	const getGapValue = (unit, size) => {
	    if (size.endsWith(unit)) {
	        return Number(size.slice(0, -1 * unit.length))
	    }
	    return null
	};

	const firstNonZero = tracks => {
	    // eslint-disable-next-line no-plusplus
	    for (let i = 0; i < tracks.length; i++) {
	        if (tracks[i].numeric > 0) {
	            return i
	        }
	    }
	    return null
	};

	const NOOP = () => false;

	const defaultWriteStyle = (element, gridTemplateProp, style) => {
	    // eslint-disable-next-line no-param-reassign
	    element.style[gridTemplateProp] = style;
	};

	const getOption = (options, propName, def) => {
	    const value = options[propName];
	    if (value !== undefined) {
	        return value
	    }
	    return def
	};

	var getMatchedCSSRules = el =>
	    []
	        .concat(
	            ...Array.from(el.ownerDocument.styleSheets).map(s => {
	                let rules = [];

	                try {
	                    rules = Array.from(s.cssRules || []);
	                } catch (e) {
	                    // Ignore results on security error
	                }

	                return rules
	            }),
	        )
	        .filter(r => {
	            let matches = false;
	            try {
	                matches = el.matches(r.selectorText);
	            } catch (e) {
	                // Ignore matching erros
	            }

	            return matches
	        });

	const gridTemplatePropColumns = 'grid-template-columns';
	const gridTemplatePropRows = 'grid-template-rows';

	class Gutter {
	  constructor(direction, options, parentOptions) {
	    this.direction = direction;
	    this.element = options.element;
	    this.track = options.track;

	    if (direction === 'column') {
	      this.gridTemplateProp = gridTemplatePropColumns;
	      this.gridGapProp = 'grid-column-gap';
	      this.cursor = getOption(
	        parentOptions,
	        'columnCursor',
	        getOption(parentOptions, 'cursor', 'col-resize'),
	      );
	      this.snapOffset = getOption(
	        parentOptions,
	        'columnSnapOffset',
	        getOption(parentOptions, 'snapOffset', 30),
	      );
	      this.dragInterval = getOption(
	        parentOptions,
	        'columnDragInterval',
	        getOption(parentOptions, 'dragInterval', 1),
	      );
	      this.clientAxis = 'clientX';
	      this.optionStyle = getOption(parentOptions, 'gridTemplateColumns');
	    } else if (direction === 'row') {
	      this.gridTemplateProp = gridTemplatePropRows;
	      this.gridGapProp = 'grid-row-gap';
	      this.cursor = getOption(
	        parentOptions,
	        'rowCursor',
	        getOption(parentOptions, 'cursor', 'row-resize'),
	      );
	      this.snapOffset = getOption(
	        parentOptions,
	        'rowSnapOffset',
	        getOption(parentOptions, 'snapOffset', 30),
	      );
	      this.dragInterval = getOption(
	        parentOptions,
	        'rowDragInterval',
	        getOption(parentOptions, 'dragInterval', 1),
	      );
	      this.clientAxis = 'clientY';
	      this.optionStyle = getOption(parentOptions, 'gridTemplateRows');
	    }

	    this.onDragStart = getOption(parentOptions, 'onDragStart', NOOP);
	    this.onDragEnd = getOption(parentOptions, 'onDragEnd', NOOP);
	    this.onDrag = getOption(parentOptions, 'onDrag', NOOP);
	    this.writeStyle = getOption(
	      parentOptions,
	      'writeStyle',
	      defaultWriteStyle,
	    );

	    this.startDragging = this.startDragging.bind(this);
	    this.stopDragging = this.stopDragging.bind(this);
	    this.drag = this.drag.bind(this);

	    this.minSizeStart = options.minSizeStart;
	    this.minSizeEnd = options.minSizeEnd;

	    if (options.element) {
	      this.element.addEventListener('mousedown', this.startDragging);
	      this.element.addEventListener('touchstart', this.startDragging);
	    }
	  }

	  getDimensions() {
	    const {
	      width,
	      height,
	      top,
	      bottom,
	      left,
	      right
	    } = this.grid.getBoundingClientRect();

	    if (this.direction === 'column') {
	      this.start = top;
	      this.end = bottom;
	      this.size = height;
	    } else if (this.direction === 'row') {
	      this.start = left;
	      this.end = right;
	      this.size = width;
	    }
	  }

	  getSizeAtTrack(track, end) {
	    return getSizeAtTrack(
	      track,
	      this.computedPixels,
	      this.computedGapPixels,
	      end,
	    );
	  }

	  getSizeOfTrack(track) {
	    return this.computedPixels[track].numeric;
	  }

	  getRawTracks() {
	    const tracks = getStyles(
	      this.gridTemplateProp,
	      [this.grid],
	      getMatchedCSSRules(this.grid),
	    );
	    if (!tracks.length) {
	      if (this.optionStyle) return this.optionStyle;

	      throw Error('Unable to determine grid template tracks from styles.');
	    }
	    return tracks[0];
	  }

	  getGap() {
	    const gap = getStyles(
	      this.gridGapProp,
	      [this.grid],
	      getMatchedCSSRules(this.grid),
	    );
	    if (!gap.length) {
	      return null;
	    }
	    return gap[0];
	  }

	  getRawComputedTracks() {
	    return window.getComputedStyle(this.grid)[this.gridTemplateProp];
	  }

	  getRawComputedGap() {
	    return window.getComputedStyle(this.grid)[this.gridGapProp];
	  }

	  setTracks(raw) {
	    this.tracks = raw.split(' ');
	    this.trackValues = parse(raw);
	  }

	  setComputedTracks(raw) {
	    this.computedTracks = raw.split(' ');
	    this.computedPixels = parse(raw);
	  }

	  setGap(raw) {
	    this.gap = raw;
	  }

	  setComputedGap(raw) {
	    this.computedGap = raw;
	    this.computedGapPixels = getGapValue('px', this.computedGap) || 0;
	  }

	  getMousePosition(e) {
	    if ('touches' in e) return e.touches[0][this.clientAxis];
	    return e[this.clientAxis];
	  }

	  startDragging(e) {
	    if ('button' in e && e.button !== 0) {
	      return;
	    }

	    // Don't actually drag the element. We emulate that in the drag function.
	    e.preventDefault();

	    if (this.element) {
	      this.grid = this.element.parentNode;
	    } else {
	      this.grid = e.target.parentNode;
	    }

	    this.getDimensions();
	    this.setTracks(this.getRawTracks());
	    this.setComputedTracks(this.getRawComputedTracks());
	    this.setGap(this.getGap());
	    this.setComputedGap(this.getRawComputedGap());

	    const trackPercentage = this.trackValues.filter(
	      track => track.type === '%',
	    );
	    const trackFr = this.trackValues.filter(track => track.type === 'fr');

	    this.totalFrs = trackFr.length;

	    if (this.totalFrs) {
	      const track = firstNonZero(trackFr);

	      if (track !== null) {
	        this.frToPixels = this.computedPixels[track].numeric / trackFr[track].numeric;
	        if (this.frToPixels === 0) {
	          this.frToPixels = Number.EPSILON;
	        }
	      }
	    }

	    if (trackPercentage.length) {
	      const track = firstNonZero(trackPercentage);

	      if (track !== null) {
	        this.percentageToPixels = this.computedPixels[track].numeric
	                    / trackPercentage[track].numeric;
	      }
	    }

	    // get start of gutter track
	    const gutterStart = this.getSizeAtTrack(this.track, false) + this.start;
	    this.dragStartOffset = this.getMousePosition(e) - gutterStart;

	    this.aTrack = this.track - 1;

	    if (this.track < this.tracks.length - 1) {
	      this.bTrack = this.track + 1;
	    } else {
	      throw Error(
	        `Invalid track index: ${this.track}. Track must be between two other tracks and only ${this.tracks.length} tracks were found.`,
	      );
	    }

	    this.aTrackStart = this.getSizeAtTrack(this.aTrack, false) + this.start;
	    this.bTrackEnd = this.getSizeAtTrack(this.bTrack, true) + this.start;

	    // Set the dragging property of the pair object.
	    this.dragging = true;

	    // All the binding. `window` gets the stop events in case we drag out of the elements.
	    window.addEventListener('mouseup', this.stopDragging);
	    window.addEventListener('touchend', this.stopDragging);
	    window.addEventListener('touchcancel', this.stopDragging);
	    window.addEventListener('mousemove', this.drag);
	    window.addEventListener('touchmove', this.drag);

	    // Disable selection. Disable!
	    this.grid.addEventListener('selectstart', NOOP);
	    this.grid.addEventListener('dragstart', NOOP);

	    this.grid.style.userSelect = 'none';
	    this.grid.style.webkitUserSelect = 'none';
	    this.grid.style.MozUserSelect = 'none';
	    this.grid.style.pointerEvents = 'none';

	    // Set the cursor at multiple levels
	    this.grid.style.cursor = this.cursor;
	    window.document.body.style.cursor = this.cursor;

	    this.onDragStart(this.direction, this.track);
	  }

	  stopDragging() {
	    this.dragging = false;

	    // Remove the stored event listeners. This is why we store them.
	    this.cleanup();

	    this.onDragEnd(this.direction, this.track);

	    if (this.needsDestroy) {
	      if (this.element) {
	        this.element.removeEventListener(
	          'mousedown',
	          this.startDragging,
	        );
	        this.element.removeEventListener(
	          'touchstart',
	          this.startDragging,
	        );
	      }
	      this.destroyCb();
	      this.needsDestroy = false;
	      this.destroyCb = null;
	    }
	  }

	  drag(e) {
	    let mousePosition = this.getMousePosition(e);

	    const gutterSize = this.getSizeOfTrack(this.track);
	    const minMousePosition = this.aTrackStart
	            + this.minSizeStart
	            + this.dragStartOffset
	            + this.computedGapPixels;
	    const maxMousePosition = this.bTrackEnd
	            - this.minSizeEnd
	            - this.computedGapPixels
	            - (gutterSize - this.dragStartOffset);
	    const minMousePositionOffset = minMousePosition + this.snapOffset;
	    const maxMousePositionOffset = maxMousePosition - this.snapOffset;

	    if (mousePosition < minMousePositionOffset) {
	      mousePosition = minMousePosition;
	    }

	    if (mousePosition > maxMousePositionOffset) {
	      mousePosition = maxMousePosition;
	    }

	    if (mousePosition < minMousePosition) {
	      mousePosition = minMousePosition;
	    } else if (mousePosition > maxMousePosition) {
	      mousePosition = maxMousePosition;
	    }

	    let aTrackSize = mousePosition
	            - this.aTrackStart
	            - this.dragStartOffset
	            - this.computedGapPixels;
	    let bTrackSize = this.bTrackEnd
	            - mousePosition
	            + this.dragStartOffset
	            - gutterSize
	            - this.computedGapPixels;

	    if (this.dragInterval > 1) {
	      const aTrackSizeIntervaled = Math.round(aTrackSize / this.dragInterval) * this.dragInterval;
	      bTrackSize -= aTrackSizeIntervaled - aTrackSize;
	      aTrackSize = aTrackSizeIntervaled;
	    }

	    if (aTrackSize < this.minSizeStart) {
	      aTrackSize = this.minSizeStart;
	    }

	    if (bTrackSize < this.minSizeEnd) {
	      bTrackSize = this.minSizeEnd;
	    }

	    if (this.trackValues[this.aTrack].type === 'px') {
	      this.tracks[this.aTrack] = `${aTrackSize}px`;
	    } else if (this.trackValues[this.aTrack].type === 'fr') {
	      if (this.totalFrs === 1) {
	        this.tracks[this.aTrack] = '1fr';
	      } else {
	        const targetFr = aTrackSize / this.frToPixels;
	        this.tracks[this.aTrack] = `${targetFr}fr`;
	      }
	    } else if (this.trackValues[this.aTrack].type === '%') {
	      const targetPercentage = aTrackSize / this.percentageToPixels;
	      this.tracks[this.aTrack] = `${targetPercentage}%`;
	    }

	    if (this.trackValues[this.bTrack].type === 'px') {
	      this.tracks[this.bTrack] = `${bTrackSize}px`;
	    } else if (this.trackValues[this.bTrack].type === 'fr') {
	      if (this.totalFrs === 1) {
	        this.tracks[this.bTrack] = '1fr';
	      } else {
	        const targetFr = bTrackSize / this.frToPixels;
	        this.tracks[this.bTrack] = `${targetFr}fr`;
	      }
	    } else if (this.trackValues[this.bTrack].type === '%') {
	      const targetPercentage = bTrackSize / this.percentageToPixels;
	      this.tracks[this.bTrack] = `${targetPercentage}%`;
	    }

	    const style = this.tracks.join(' ');
	    this.writeStyle(this.grid, this.gridTemplateProp, style);
	    this.onDrag(this.direction, this.track, style);
	  }

	  cleanup() {
	    window.removeEventListener('mouseup', this.stopDragging);
	    window.removeEventListener('touchend', this.stopDragging);
	    window.removeEventListener('touchcancel', this.stopDragging);
	    window.removeEventListener('mousemove', this.drag);
	    window.removeEventListener('touchmove', this.drag);

	    if (this.grid) {
	      this.grid.removeEventListener('selectstart', NOOP);
	      this.grid.removeEventListener('dragstart', NOOP);

	      this.grid.style.userSelect = '';
	      this.grid.style.webkitUserSelect = '';
	      this.grid.style.MozUserSelect = '';
	      this.grid.style.pointerEvents = '';

	      this.grid.style.cursor = '';
	    }

	    window.document.body.style.cursor = '';
	  }

	  destroy(immediate = true, cb) {
	    if (immediate || this.dragging === false) {
	      this.cleanup();
	      if (this.element) {
	        this.element.removeEventListener(
	          'mousedown',
	          this.startDragging,
	        );
	        this.element.removeEventListener(
	          'touchstart',
	          this.startDragging,
	        );
	      }

	      if (cb) {
	        cb();
	      }
	    } else {
	      this.needsDestroy = true;
	      if (cb) {
	        this.destroyCb = cb;
	      }
	    }
	  }
	}

	const getTrackOption = (options, track, defaultValue) => {
	    if (track in options) {
	        return options[track]
	    }

	    return defaultValue
	};

	const createGutter = (direction, options) => gutterOptions => {
	    if (gutterOptions.track < 1) {
	        throw Error(
	            `Invalid track index: ${gutterOptions.track}. Track must be between two other tracks.`,
	        )
	    }

	    const trackMinSizes =
	        direction === 'column'
	            ? options.columnMinSizes || {}
	            : options.rowMinSizes || {};
	    const trackMinSize = direction === 'column' ? 'columnMinSize' : 'rowMinSize';

	    return new Gutter(
	        direction,
	        {
	            minSizeStart: getTrackOption(
	                trackMinSizes,
	                gutterOptions.track - 1,
	                getOption(
	                    options,
	                    trackMinSize,
	                    getOption(options, 'minSize', 0),
	                ),
	            ),
	            minSizeEnd: getTrackOption(
	                trackMinSizes,
	                gutterOptions.track + 1,
	                getOption(
	                    options,
	                    trackMinSize,
	                    getOption(options, 'minSize', 0),
	                ),
	            ),
	            ...gutterOptions,
	        },
	        options,
	    )
	};

	class Grid {
	    constructor(options) {
	        this.columnGutters = {};
	        this.rowGutters = {};

	        this.options = {
	            columnGutters: options.columnGutters || [],
	            rowGutters: options.rowGutters || [],
	            columnMinSizes: options.columnMinSizes || {},
	            rowMinSizes: options.rowMinSizes || {},
	            ...options,
	        };

	        this.options.columnGutters.forEach(gutterOptions => {
	            this.columnGutters[options.track] = createGutter(
	                'column',
	                this.options,
	            )(gutterOptions);
	        });

	        this.options.rowGutters.forEach(gutterOptions => {
	            this.rowGutters[options.track] = createGutter(
	                'row',
	                this.options,
	            )(gutterOptions);
	        });
	    }

	    addColumnGutter(element, track) {
	        if (this.columnGutters[track]) {
	            this.columnGutters[track].destroy();
	        }

	        this.columnGutters[track] = createGutter(
	            'column',
	            this.options,
	        )({
	            element,
	            track,
	        });
	    }

	    addRowGutter(element, track) {
	        if (this.rowGutters[track]) {
	            this.rowGutters[track].destroy();
	        }

	        this.rowGutters[track] = createGutter(
	            'row',
	            this.options,
	        )({
	            element,
	            track,
	        });
	    }

	    removeColumnGutter(track, immediate = true) {
	        if (this.columnGutters[track]) {
	            this.columnGutters[track].destroy(immediate, () => {
	                delete this.columnGutters[track];
	            });
	        }
	    }

	    removeRowGutter(track, immediate = true) {
	        if (this.rowGutters[track]) {
	            this.rowGutters[track].destroy(immediate, () => {
	                delete this.rowGutters[track];
	            });
	        }
	    }

	    handleDragStart(e, direction, track) {
	        if (direction === 'column') {
	            if (this.columnGutters[track]) {
	                this.columnGutters[track].destroy();
	            }

	            this.columnGutters[track] = createGutter(
	                'column',
	                this.options,
	            )({
	                track,
	            });
	            this.columnGutters[track].startDragging(e);
	        } else if (direction === 'row') {
	            if (this.rowGutters[track]) {
	                this.rowGutters[track].destroy();
	            }

	            this.rowGutters[track] = createGutter(
	                'row',
	                this.options,
	            )({
	                track,
	            });
	            this.rowGutters[track].startDragging(e);
	        }
	    }

	    destroy(immediate = true) {
	        Object.keys(this.columnGutters).forEach(track =>
	            this.columnGutters[track].destroy(immediate, () => {
	                delete this.columnGutters[track];
	            }),
	        );
	        Object.keys(this.rowGutters).forEach(track =>
	            this.rowGutters[track].destroy(immediate, () => {
	                delete this.rowGutters[track];
	            }),
	        );
	    }
	}

	var Split = options => new Grid(options);

	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//

	var script$2 = {
	  name: 'EvLayoutChild',

	  props: {
	    child: Object
	  },

	  computed: {
	    classForChild() {
	      if (this.child && this.child.name) {
	        return `ev-pane-${this.child.name}`;
	      }

	      return '';
	    },

	    childStyle() {
	      if (!this.child.sizes || !this.child.sizes.length || !this.child.direction) {
	        return;
	      }

	      let sizes = this.child.sizes.map(s => [s, 0]).flat();
	      sizes.pop();

	      return `grid-template-${this.child.direction}s: ${sizes.join(' ')}`;
	    }
	  },

	  methods: {
	    gutterClass(child, direction) {
	      let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;

	      if (child.resizable === false) {
	        className += ' ev-gutter-no-resize';
	      }

	      return className;
	    }

	  }
	};

	/* script */
	const __vue_script__$2 = script$2;

	/* template */
	var __vue_render__$2 = function() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c(
	    "div",
	    {
	      staticClass: "d-grid overflow-hidden h-100 w-100",
	      class: _vm.classForChild,
	      style: _vm.childStyle,
	      attrs: { "data-min-size": _vm.child.minSize }
	    },
	    [
	      !_vm.child.panes
	        ? _c(
	            "div",
	            { staticClass: "ev-layout-pane h-100 w-100 overflow-auto" },
	            [_vm._t(_vm.child.name)],
	            2
	          )
	        : _vm._e(),
	      _vm._v(" "),
	      _vm._l(_vm.child.panes, function(grandChild, idx) {
	        return [
	          _c(
	            "ev-layout-child",
	            {
	              key: grandChild.name,
	              attrs: { child: grandChild },
	              scopedSlots: _vm._u(
	                [
	                  _vm._l(_vm.$scopedSlots, function(_, name) {
	                    return {
	                      key: name,
	                      fn: function(slotData) {
	                        return [_vm._t(name, null, null, slotData)]
	                      }
	                    }
	                  })
	                ],
	                null,
	                true
	              )
	            },
	            [
	              _vm._l(_vm.$slots, function(_, name) {
	                return _vm._t(name, null, { slot: name })
	              })
	            ],
	            2
	          ),
	          _vm._v(" "),
	          _vm.child.panes[idx + 1]
	            ? _c("div", {
	                key: grandChild.name + "gutter",
	                class: _vm.gutterClass(grandChild, _vm.child.direction)
	              })
	            : _vm._e()
	        ]
	      })
	    ],
	    2
	  )
	};
	var __vue_staticRenderFns__$2 = [];
	__vue_render__$2._withStripped = true;

	  /* style */
	  const __vue_inject_styles__$2 = function (inject) {
	    if (!inject) return
	    inject("data-v-a47def0c_0", { source: "*[data-v-a47def0c] {\n  box-sizing: border-box;\n}\n*[data-v-a47def0c]:before,\n*[data-v-a47def0c]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-a47def0c] {\n  height: 100%;\n}\n.vh-100[data-v-a47def0c] {\n  height: 100vh;\n}\n.w-100[data-v-a47def0c] {\n  width: 100%;\n}\n.vw-100[data-v-a47def0c] {\n  width: 100vw;\n}\n.pre-line[data-v-a47def0c] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-a47def0c] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-a47def0c] {\n  white-space: nowrap;\n}\n.d-block[data-v-a47def0c] {\n  display: block;\n}\n.d-inline-block[data-v-a47def0c] {\n  display: inline-block;\n}\n.d-flex[data-v-a47def0c] {\n  display: flex;\n}\n.d-inline-flex[data-v-a47def0c] {\n  display: inline-flex;\n}\n.d-grid[data-v-a47def0c] {\n  display: grid;\n}\n.d-none[data-v-a47def0c] {\n  display: none;\n}\n.hide[data-v-a47def0c] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-a47def0c] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-a47def0c] {\n  overflow: auto;\n}\n.flex-center[data-v-a47def0c] {\n  justify-content: center;\n}\n.flex-middle[data-v-a47def0c] {\n  align-items: center;\n}\n.flex-grow[data-v-a47def0c] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-a47def0c] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-a47def0c] {\n  flex-direction: column;\n}\n.flex-space[data-v-a47def0c] {\n  justify-content: space-between;\n}\n.flex-end[data-v-a47def0c] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-a47def0c] {\n  justify-content: flex-start;\n}\n.text-center[data-v-a47def0c] {\n  text-align: center;\n}\n.m-z[data-v-a47def0c] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-a47def0c] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-a47def0c] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-a47def0c] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-a47def0c] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-a47def0c] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-a47def0c] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-a47def0c] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-a47def0c] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-a47def0c] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-a47def0c] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-a47def0c] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-a47def0c] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-a47def0c] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-a47def0c] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-a47def0c] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-a47def0c] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-a47def0c] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-a47def0c] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-a47def0c] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-a47def0c] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-a47def0c] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-a47def0c] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-a47def0c] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-a47def0c] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-a47def0c] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-a47def0c] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-a47def0c] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-a47def0c] {\n  margin-left: 2px;\n}\n.p-z[data-v-a47def0c] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-a47def0c] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-a47def0c] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-a47def0c] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-a47def0c] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-a47def0c] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-a47def0c] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-a47def0c] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-a47def0c] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-a47def0c] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-a47def0c] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-a47def0c] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-a47def0c] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-a47def0c] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-a47def0c] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-a47def0c] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-a47def0c] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-a47def0c] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-a47def0c] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-a47def0c] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-a47def0c] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-a47def0c] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-a47def0c] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-a47def0c] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-a47def0c] {\n  padding-left: 5px;\n}\n.p-xs[data-v-a47def0c] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-a47def0c] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-a47def0c] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-a47def0c] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-a47def0c] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-a47def0c] {\n  padding: 2px;\n}\n.p-xs[data-v-a47def0c] {\n  padding: 5px;\n}\n.p-sm[data-v-a47def0c] {\n  padding: 10px;\n}\n.p-med[data-v-a47def0c] {\n  padding: 15px;\n}\n.p-lg[data-v-a47def0c] {\n  padding: 20px;\n}\n.p-xl[data-v-a47def0c] {\n  padding: 25px;\n}\n.m-xxs[data-v-a47def0c] {\n  margin: 2px;\n}\n.m-xs[data-v-a47def0c] {\n  margin: 5px;\n}\n.m-sm[data-v-a47def0c] {\n  margin: 10px;\n}\n.m-med[data-v-a47def0c] {\n  margin: 15px;\n}\n.m-lg[data-v-a47def0c] {\n  margin: 20px;\n}\n.m-xl[data-v-a47def0c] {\n  margin: 25px;\n}\n.ev-gutter-column[data-v-a47def0c] {\n  cursor: col-resize;\n}\n.ev-gutter-row[data-v-a47def0c] {\n  cursor: row-resize;\n}\n.ev-gutter[data-v-a47def0c]:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column[data-v-a47def0c]::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row[data-v-a47def0c]::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayoutChild.vue.map */", map: {"version":3,"sources":["EvLayoutChild.vue","/Users/john/Code/evwt/packages/EvLayout/src/EvLayoutChild.vue"],"names":[],"mappings":"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","file":"EvLayoutChild.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-gutter-column {\n  cursor: col-resize;\n}\n\n.ev-gutter-row {\n  cursor: row-resize;\n}\n\n.ev-gutter:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayoutChild.vue.map */","<template>\n  <div\n    :style=\"childStyle\"\n    :data-min-size=\"child.minSize\"\n    class=\"d-grid overflow-hidden h-100 w-100\"\n    :class=\"classForChild\">\n    <div v-if=\"!child.panes\" class=\"ev-layout-pane h-100 w-100 overflow-auto\">\n      <slot :name=\"child.name\" class=\"overflow-auto\" />\n    </div>\n\n    <template v-for=\"(grandChild, idx) in child.panes\">\n      <ev-layout-child\n        :key=\"grandChild.name\"\n        :child=\"grandChild\">\n        <slot v-for=\"(_, name) in $slots\" :slot=\"name\" :name=\"name\" />\n        <template v-for=\"(_, name) in $scopedSlots\" :slot=\"name\" slot-scope=\"slotData\">\n          <slot :name=\"name\" v-bind=\"slotData\" />\n        </template>\n      </ev-layout-child>\n\n      <div\n        v-if=\"child.panes[idx + 1]\"\n        :key=\"grandChild.name + 'gutter'\"\n        :class=\"gutterClass(grandChild, child.direction)\" />\n    </template>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'EvLayoutChild',\n\n  props: {\n    child: Object\n  },\n\n  computed: {\n    classForChild() {\n      if (this.child && this.child.name) {\n        return `ev-pane-${this.child.name}`;\n      }\n\n      return '';\n    },\n\n    childStyle() {\n      if (!this.child.sizes || !this.child.sizes.length || !this.child.direction) {\n        return;\n      }\n\n      let sizes = this.child.sizes.map(s => [s, 0]).flat();\n      sizes.pop();\n\n      return `grid-template-${this.child.direction}s: ${sizes.join(' ')}`;\n    }\n  },\n\n  methods: {\n    gutterClass(child, direction) {\n      let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;\n\n      if (child.resizable === false) {\n        className += ' ev-gutter-no-resize';\n      }\n\n      return className;\n    }\n\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '@/../style/reset.scss';\n@import '@/../style/utilities.scss';\n@import '@/../style/split-grid.scss';\n</style>\n"]}, media: undefined });

	  };
	  /* scoped */
	  const __vue_scope_id__$2 = "data-v-a47def0c";
	  /* module identifier */
	  const __vue_module_identifier__$2 = undefined;
	  /* functional template */
	  const __vue_is_functional_template__$2 = false;
	  /* style inject SSR */
	  
	  /* style inject shadow dom */
	  

	  
	  const __vue_component__$2 = /*#__PURE__*/normalizeComponent(
	    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
	    __vue_inject_styles__$2,
	    __vue_script__$2,
	    __vue_scope_id__$2,
	    __vue_is_functional_template__$2,
	    __vue_module_identifier__$2,
	    false,
	    createInjector,
	    undefined,
	    undefined
	  );

	//

	var script$3 = {
	  name: 'EvLayout',

	  components: {
	    EvLayoutChild: __vue_component__$2
	  },

	  props: {
	    // The top-level Pane
	    layout: {
	      type: Object,
	      required: true
	    }
	  },

	  async mounted() {
	    let rowGutters = [...this.$el.querySelectorAll('.ev-gutter-row')].map((gutter) => ({
	      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),
	      element: gutter
	    }));

	    let columnGutters = [...this.$el.querySelectorAll('.ev-gutter-column')].map((gutter) => ({
	      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),
	      element: gutter
	    }));

	    let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce((acc, gutter) => {
	      let pane = gutter.previousElementSibling;
	      let minSize = parseInt(pane.dataset.minSize || 0);
	      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);
	      acc[index] = minSize;
	      return acc;
	    }, {});

	    let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce((acc, gutter) => {
	      let pane = gutter.previousElementSibling;
	      let minSize = parseInt(pane.dataset.minSize || 0);
	      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);
	      acc[index] = minSize;
	      return acc;
	    }, {});

	    let onDragStart = (direction, track) => {
	      // Fired when any pane starts dragging
	      // @arg direction, track
	      this.$emit('dragStart', { direction, track });
	    };

	    let onDrag = (direction, track, gridTemplateStyle) => {
	      // Fired when any pane is dragging
	      // @arg direction, track, gridTemplateStyle
	      this.$emit('drag', { direction, track, gridTemplateStyle });
	    };

	    let onDragEnd = (direction, track) => {
	      // Fired when any pane ends dragging
	      // @arg direction, track
	      this.$emit('dragEnd', { direction, track });
	    };

	    Split({
	      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd
	    });
	  }
	};

	/* script */
	const __vue_script__$3 = script$3;

	/* template */
	var __vue_render__$3 = function() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c(
	    "ev-layout-child",
	    {
	      attrs: { child: _vm.layout },
	      scopedSlots: _vm._u(
	        [
	          _vm._l(_vm.$scopedSlots, function(_, name) {
	            return {
	              key: name,
	              fn: function(slotData) {
	                return [_vm._t(name, null, null, slotData)]
	              }
	            }
	          })
	        ],
	        null,
	        true
	      )
	    },
	    [
	      _vm._l(_vm.$slots, function(_, name) {
	        return _vm._t(name, null, { slot: name })
	      })
	    ],
	    2
	  )
	};
	var __vue_staticRenderFns__$3 = [];
	__vue_render__$3._withStripped = true;

	  /* style */
	  const __vue_inject_styles__$3 = function (inject) {
	    if (!inject) return
	    inject("data-v-63e0c8bd_0", { source: "*[data-v-63e0c8bd] {\n  box-sizing: border-box;\n}\n*[data-v-63e0c8bd]:before,\n*[data-v-63e0c8bd]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-63e0c8bd] {\n  height: 100%;\n}\n.vh-100[data-v-63e0c8bd] {\n  height: 100vh;\n}\n.w-100[data-v-63e0c8bd] {\n  width: 100%;\n}\n.vw-100[data-v-63e0c8bd] {\n  width: 100vw;\n}\n.pre-line[data-v-63e0c8bd] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-63e0c8bd] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-63e0c8bd] {\n  white-space: nowrap;\n}\n.d-block[data-v-63e0c8bd] {\n  display: block;\n}\n.d-inline-block[data-v-63e0c8bd] {\n  display: inline-block;\n}\n.d-flex[data-v-63e0c8bd] {\n  display: flex;\n}\n.d-inline-flex[data-v-63e0c8bd] {\n  display: inline-flex;\n}\n.d-grid[data-v-63e0c8bd] {\n  display: grid;\n}\n.d-none[data-v-63e0c8bd] {\n  display: none;\n}\n.hide[data-v-63e0c8bd] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-63e0c8bd] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-63e0c8bd] {\n  overflow: auto;\n}\n.flex-center[data-v-63e0c8bd] {\n  justify-content: center;\n}\n.flex-middle[data-v-63e0c8bd] {\n  align-items: center;\n}\n.flex-grow[data-v-63e0c8bd] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-63e0c8bd] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-63e0c8bd] {\n  flex-direction: column;\n}\n.flex-space[data-v-63e0c8bd] {\n  justify-content: space-between;\n}\n.flex-end[data-v-63e0c8bd] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-63e0c8bd] {\n  justify-content: flex-start;\n}\n.text-center[data-v-63e0c8bd] {\n  text-align: center;\n}\n.m-z[data-v-63e0c8bd] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-63e0c8bd] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-63e0c8bd] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-63e0c8bd] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-63e0c8bd] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-63e0c8bd] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-63e0c8bd] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-63e0c8bd] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-63e0c8bd] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-63e0c8bd] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-63e0c8bd] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-63e0c8bd] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-63e0c8bd] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-63e0c8bd] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-63e0c8bd] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-63e0c8bd] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-63e0c8bd] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-63e0c8bd] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-63e0c8bd] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-63e0c8bd] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-63e0c8bd] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-63e0c8bd] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-63e0c8bd] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-63e0c8bd] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-63e0c8bd] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-63e0c8bd] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-63e0c8bd] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-63e0c8bd] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-63e0c8bd] {\n  margin-left: 2px;\n}\n.p-z[data-v-63e0c8bd] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-63e0c8bd] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-63e0c8bd] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-63e0c8bd] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-63e0c8bd] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-63e0c8bd] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-63e0c8bd] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-63e0c8bd] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-63e0c8bd] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-63e0c8bd] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-63e0c8bd] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-63e0c8bd] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-63e0c8bd] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-63e0c8bd] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-63e0c8bd] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-63e0c8bd] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-63e0c8bd] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-63e0c8bd] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-63e0c8bd] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-63e0c8bd] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-63e0c8bd] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-63e0c8bd] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-63e0c8bd] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-63e0c8bd] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-63e0c8bd] {\n  padding-left: 5px;\n}\n.p-xs[data-v-63e0c8bd] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-63e0c8bd] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-63e0c8bd] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-63e0c8bd] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-63e0c8bd] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-63e0c8bd] {\n  padding: 2px;\n}\n.p-xs[data-v-63e0c8bd] {\n  padding: 5px;\n}\n.p-sm[data-v-63e0c8bd] {\n  padding: 10px;\n}\n.p-med[data-v-63e0c8bd] {\n  padding: 15px;\n}\n.p-lg[data-v-63e0c8bd] {\n  padding: 20px;\n}\n.p-xl[data-v-63e0c8bd] {\n  padding: 25px;\n}\n.m-xxs[data-v-63e0c8bd] {\n  margin: 2px;\n}\n.m-xs[data-v-63e0c8bd] {\n  margin: 5px;\n}\n.m-sm[data-v-63e0c8bd] {\n  margin: 10px;\n}\n.m-med[data-v-63e0c8bd] {\n  margin: 15px;\n}\n.m-lg[data-v-63e0c8bd] {\n  margin: 20px;\n}\n.m-xl[data-v-63e0c8bd] {\n  margin: 25px;\n}\n.ev-gutter-column[data-v-63e0c8bd] {\n  cursor: col-resize;\n}\n.ev-gutter-row[data-v-63e0c8bd] {\n  cursor: row-resize;\n}\n.ev-gutter[data-v-63e0c8bd]:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column[data-v-63e0c8bd]::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row[data-v-63e0c8bd]::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayout.vue.map */", map: {"version":3,"sources":["EvLayout.vue","/Users/john/Code/evwt/packages/EvLayout/src/EvLayout.vue"],"names":[],"mappings":"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","file":"EvLayout.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-gutter-column {\n  cursor: col-resize;\n}\n\n.ev-gutter-row {\n  cursor: row-resize;\n}\n\n.ev-gutter:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayout.vue.map */","<template>\n  <ev-layout-child :child=\"layout\">\n    <!-- @vuese-ignore -->\n    <slot v-for=\"(_, name) in $slots\" :slot=\"name\" :name=\"name\" />\n    <template v-for=\"(_, name) in $scopedSlots\" :slot=\"name\" slot-scope=\"slotData\">\n      <!-- @vuese-ignore -->\n      <slot :name=\"name\" v-bind=\"slotData\" />\n    </template>\n  </ev-layout-child>\n</template>\n\n<script>\nimport Split from '@/../vendor/split-grid';\nimport EvLayoutChild from './EvLayoutChild.vue';\n\nexport default {\n  name: 'EvLayout',\n\n  components: {\n    EvLayoutChild\n  },\n\n  props: {\n    // The top-level Pane\n    layout: {\n      type: Object,\n      required: true\n    }\n  },\n\n  async mounted() {\n    let rowGutters = [...this.$el.querySelectorAll('.ev-gutter-row')].map((gutter) => ({\n      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),\n      element: gutter\n    }));\n\n    let columnGutters = [...this.$el.querySelectorAll('.ev-gutter-column')].map((gutter) => ({\n      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),\n      element: gutter\n    }));\n\n    let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce((acc, gutter) => {\n      let pane = gutter.previousElementSibling;\n      let minSize = parseInt(pane.dataset.minSize || 0);\n      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);\n      acc[index] = minSize;\n      return acc;\n    }, {});\n\n    let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce((acc, gutter) => {\n      let pane = gutter.previousElementSibling;\n      let minSize = parseInt(pane.dataset.minSize || 0);\n      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);\n      acc[index] = minSize;\n      return acc;\n    }, {});\n\n    let onDragStart = (direction, track) => {\n      // Fired when any pane starts dragging\n      // @arg direction, track\n      this.$emit('dragStart', { direction, track });\n    };\n\n    let onDrag = (direction, track, gridTemplateStyle) => {\n      // Fired when any pane is dragging\n      // @arg direction, track, gridTemplateStyle\n      this.$emit('drag', { direction, track, gridTemplateStyle });\n    };\n\n    let onDragEnd = (direction, track) => {\n      // Fired when any pane ends dragging\n      // @arg direction, track\n      this.$emit('dragEnd', { direction, track });\n    };\n\n    Split({\n      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd\n    });\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '@/../style/reset.scss';\n@import '@/../style/utilities.scss';\n@import '@/../style/split-grid.scss';\n</style>\n"]}, media: undefined });

	  };
	  /* scoped */
	  const __vue_scope_id__$3 = "data-v-63e0c8bd";
	  /* module identifier */
	  const __vue_module_identifier__$3 = undefined;
	  /* functional template */
	  const __vue_is_functional_template__$3 = false;
	  /* style inject SSR */
	  
	  /* style inject shadow dom */
	  

	  
	  const __vue_component__$3 = /*#__PURE__*/normalizeComponent(
	    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
	    __vue_inject_styles__$3,
	    __vue_script__$3,
	    __vue_scope_id__$3,
	    __vue_is_functional_template__$3,
	    __vue_module_identifier__$3,
	    false,
	    createInjector,
	    undefined,
	    undefined
	  );

	__vue_component__$3.install = function(Vue) {
	  Vue.component(__vue_component__$3.name, __vue_component__$3);
	};

	const EvMenu = {};

	// Walk the menu and find any submenus that contain only radio items
	// Then apply the mutually-exclusive logic to these items
	function setRadioMenus(menu) {
	  for (let idx = 0; idx < menu.length; idx++) {
	    let submenu = menu[idx];
	    if (!submenu) return;

	    if (submenu.submenu && submenu.submenu.length) {
	      let isRadioMenu = submenu.submenu.every(item => item.type === 'radio');

	      if (isRadioMenu) {
	        for (let jdx = 0; jdx < submenu.submenu.length; jdx++) {
	          if (submenu.submenu[jdx].lastChecked) {
	            // This was the last checked item, set it to true
	            submenu.submenu[jdx].checked = true;
	            submenu.submenu[jdx].lastChecked = false;
	          } else {
	            // Everything else, set to false
	            submenu.submenu[jdx].checked = false;
	          }
	        }
	      }
	    }

	    if (submenu.submenu) {
	      setRadioMenus(submenu.submenu);
	    }
	  }
	}

	/**
	 * Get menu by id
	 *
	 * @param {String} id
	 * @returns {MenuItem}
	 */
	function get$1(id) {
	  return this.findMenuItem(this.menu, id);
	}

	EvMenu.install = function (Vue, menuDefinition) {
	  let menuVm = new Vue({
	    data() {
	      return {
	        menu: Vue.observable(menuDefinition),
	        initialLoad: true,
	        isDirty: false
	      };
	    },

	    watch: {
	      menu: {
	        deep: true,
	        handler(newMenu) {
	          if (this.isDirty) {
	            this.isDirty = false;
	            return;
	          }

	          if (this.initialLoad) {
	            this.initialLoad = false;
	          } else {
	            this.isDirty = true;

	            setRadioMenus(newMenu);
	          }

	          electron.ipcRenderer.invoke('evmenu:ipc:set', newMenu);
	        }
	      }
	    },

	    async created() {
	      // evmenu:ipc:set will return a built menu with all the details,
	      // as opposed to just the definition
	      this.menu = await electron.ipcRenderer.invoke('evmenu:ipc:set', menuDefinition);

	      this.handleClick();
	      this.handleFocus();
	      this.listenIpc();
	    },

	    methods: {
	      get: get$1,

	      findMenuItem(items, id) {
	        if (!items) { return; }

	        for (let item of items) {
	          if (item.id === id) return item;

	          if (item.submenu) {
	            let child = this.findMenuItem(item.submenu, id);
	            if (child) return child;
	          }
	        }
	      },

	      handleFocus() {
	        window.addEventListener('focus', () => {
	          electron.ipcRenderer.invoke('evmenu:ipc:set', this.menu);
	        });
	      },

	      handleClick() {
	        this.$on('click', command => {
	          let menuItem = this.get(command);

	          if (menuItem.type === 'radio') {
	            menuItem.lastChecked = true;
	          }

	          this.$emit(`input:${command}`, menuItem);
	          this.$emit('input', menuItem);
	          electron.ipcRenderer.send('evmenu:ipc:click', menuItem);
	        });
	      },

	      listenIpc() {
	        electron.ipcRenderer.on('evmenu:ipc:input', (event, payload) => {
	          let menuItem = this.get(payload.id);

	          for (let key of Object.keys(payload)) {
	            menuItem[key] = payload[key];
	          }

	          if (menuItem.type === 'radio') {
	            menuItem.lastChecked = true;
	          }

	          this.$emit('input', payload);
	          this.$emit(`input:${payload.id}`, payload);
	        });
	      }
	    }
	  });

	  Vue.prototype.$evmenu = menuVm;
	};

	const EvStore = {};

	EvStore.install = function (Vue) {
	  let initialStore = electron.ipcRenderer.sendSync('evstore:ipc:store');

	  let storeVm = new Vue({
	    data() {
	      return {
	        store: initialStore,
	        storeProxy: null,
	        isClean: false
	      };
	    },

	    computed: {
	      size() {
	        return electron.ipcRenderer.invoke('evstore:ipc:size');
	      },

	      path() {
	        return electron.ipcRenderer.invoke('evstore:ipc:path');
	      }
	    },

	    watch: {
	      store: {
	        handler(newStore) {
	          if (this.isClean) {
	            this.isClean = false;
	            return;
	          }

	          electron.ipcRenderer.sendSync('evstore:ipc:write', newStore);
	        },
	        deep: true
	      },
	      storeProxy: {
	        handler() {
	          electron.ipcRenderer.sendSync('evstore:ipc:write', { ...this.storeProxy });
	        },
	        deep: true
	      }
	    },

	    created() {
	      // Creating and then watching this proxy notices more changes on objects, so you can do this:
	      // this.$evstore.store.key = value;
	      // instead of this:
	      // this.$set(this.$evstore.store, key, value);
	      this.storeProxy = new Proxy(this.store, {});

	      this.watchRemote();
	    },

	    methods: {
	      watchRemote() {
	        electron.ipcRenderer.on('evstore:ipc:changed', (e, store) => {
	          this.isClean = true;
	          this.store = store;
	        });
	      }
	    }
	  });

	  Vue.prototype.$evstore = storeVm;
	};

	var script$4 = {
	  props: {
	    // Whether to display icons for items by default
	    iconShow: {
	      type: Boolean,
	      default: true
	    },
	    // Default size of the icons in px
	    iconSize: {
	      type: Number,
	      default: 16
	    },
	    // Default position of icon in relation to the label
	    iconPos: {
	      // `'above'`/`'aside'`
	      type: String,
	      default: 'above'
	    },
	    // Whether to display labels for items by default
	    labelShow: {
	      type: Boolean,
	      default: false
	    },
	    // Default font size of the labels in px
	    fontSize: {
	      type: Number,
	      default: 11
	    },
	    // Default padding within the items in px
	    padding: {
	      type: Number,
	      default: 3
	    },
	    // Default minimum width of items
	    minWidth: {
	      type: Number,
	      default: 44
	    },
	    // Height of the toolbar in px
	    height: {
	      type: Number
	    }
	  },

	  computed: {
	    toolbarStyle() {
	      if (this.height) {
	        return `height: ${this.height}px`;
	      }

	      return '';
	    }
	  },

	  render(createElement) {
	    let attrs = {
	      class: 'ev-toolbar d-flex h-100 flex-middle p-n-xs p-s-xs p-w-xs p-e-xs',
	      style: this.toolbarStyle
	    };

	    if (!this.$slots.default) {
	      return createElement('div', attrs);
	    }

	    for (const vnode of this.$slots.default) {
	      vnode.componentOptions.propsData = {
	        labelShow: this.labelShow,
	        iconPos: this.iconPos,
	        iconSize: this.iconSize,
	        fontSize: this.fontSize,
	        minWidth: this.minWidth,
	        padding: this.padding,
	        iconShow: this.iconShow,
	        ...vnode.componentOptions.propsData
	      };
	    }

	    return createElement('div', attrs, this.$slots.default);
	  }
	};

	/* script */
	const __vue_script__$4 = script$4;

	/* template */

	  /* style */
	  const __vue_inject_styles__$4 = function (inject) {
	    if (!inject) return
	    inject("data-v-1e6336ec_0", { source: "*[data-v-1e6336ec] {\n  box-sizing: border-box;\n}\n*[data-v-1e6336ec]:before,\n*[data-v-1e6336ec]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-1e6336ec] {\n  height: 100%;\n}\n.vh-100[data-v-1e6336ec] {\n  height: 100vh;\n}\n.w-100[data-v-1e6336ec] {\n  width: 100%;\n}\n.vw-100[data-v-1e6336ec] {\n  width: 100vw;\n}\n.pre-line[data-v-1e6336ec] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-1e6336ec] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-1e6336ec] {\n  white-space: nowrap;\n}\n.d-block[data-v-1e6336ec] {\n  display: block;\n}\n.d-inline-block[data-v-1e6336ec] {\n  display: inline-block;\n}\n.d-flex[data-v-1e6336ec] {\n  display: flex;\n}\n.d-inline-flex[data-v-1e6336ec] {\n  display: inline-flex;\n}\n.d-grid[data-v-1e6336ec] {\n  display: grid;\n}\n.d-none[data-v-1e6336ec] {\n  display: none;\n}\n.hide[data-v-1e6336ec] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-1e6336ec] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-1e6336ec] {\n  overflow: auto;\n}\n.flex-center[data-v-1e6336ec] {\n  justify-content: center;\n}\n.flex-middle[data-v-1e6336ec] {\n  align-items: center;\n}\n.flex-grow[data-v-1e6336ec] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-1e6336ec] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-1e6336ec] {\n  flex-direction: column;\n}\n.flex-space[data-v-1e6336ec] {\n  justify-content: space-between;\n}\n.flex-end[data-v-1e6336ec] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-1e6336ec] {\n  justify-content: flex-start;\n}\n.text-center[data-v-1e6336ec] {\n  text-align: center;\n}\n.m-z[data-v-1e6336ec] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-1e6336ec] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-1e6336ec] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-1e6336ec] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-1e6336ec] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-1e6336ec] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-1e6336ec] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-1e6336ec] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-1e6336ec] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-1e6336ec] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-1e6336ec] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-1e6336ec] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-1e6336ec] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-1e6336ec] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-1e6336ec] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-1e6336ec] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-1e6336ec] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-1e6336ec] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-1e6336ec] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-1e6336ec] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-1e6336ec] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-1e6336ec] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-1e6336ec] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-1e6336ec] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-1e6336ec] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-1e6336ec] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-1e6336ec] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-1e6336ec] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-1e6336ec] {\n  margin-left: 2px;\n}\n.p-z[data-v-1e6336ec] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-1e6336ec] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-1e6336ec] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-1e6336ec] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-1e6336ec] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-1e6336ec] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-1e6336ec] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-1e6336ec] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-1e6336ec] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-1e6336ec] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-1e6336ec] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-1e6336ec] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-1e6336ec] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-1e6336ec] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-1e6336ec] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-1e6336ec] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-1e6336ec] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-1e6336ec] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-1e6336ec] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-1e6336ec] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-1e6336ec] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-1e6336ec] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-1e6336ec] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-1e6336ec] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-1e6336ec] {\n  padding-left: 5px;\n}\n.p-xs[data-v-1e6336ec] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-1e6336ec] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-1e6336ec] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-1e6336ec] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-1e6336ec] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-1e6336ec] {\n  padding: 2px;\n}\n.p-xs[data-v-1e6336ec] {\n  padding: 5px;\n}\n.p-sm[data-v-1e6336ec] {\n  padding: 10px;\n}\n.p-med[data-v-1e6336ec] {\n  padding: 15px;\n}\n.p-lg[data-v-1e6336ec] {\n  padding: 20px;\n}\n.p-xl[data-v-1e6336ec] {\n  padding: 25px;\n}\n.m-xxs[data-v-1e6336ec] {\n  margin: 2px;\n}\n.m-xs[data-v-1e6336ec] {\n  margin: 5px;\n}\n.m-sm[data-v-1e6336ec] {\n  margin: 10px;\n}\n.m-med[data-v-1e6336ec] {\n  margin: 15px;\n}\n.m-lg[data-v-1e6336ec] {\n  margin: 20px;\n}\n.m-xl[data-v-1e6336ec] {\n  margin: 25px;\n}\n.ev-toolbar[data-v-1e6336ec] {\n  user-select: none;\n}\n\n/*# sourceMappingURL=EvToolbar.vue.map */", map: {"version":3,"sources":["EvToolbar.vue","/Users/john/Code/evwt/packages/EvToolbar/src/EvToolbar.vue"],"names":[],"mappings":"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","file":"EvToolbar.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-toolbar {\n  user-select: none;\n}\n\n/*# sourceMappingURL=EvToolbar.vue.map */","<script>\nexport default {\n  props: {\n    // Whether to display icons for items by default\n    iconShow: {\n      type: Boolean,\n      default: true\n    },\n    // Default size of the icons in px\n    iconSize: {\n      type: Number,\n      default: 16\n    },\n    // Default position of icon in relation to the label\n    iconPos: {\n      // `'above'`/`'aside'`\n      type: String,\n      default: 'above'\n    },\n    // Whether to display labels for items by default\n    labelShow: {\n      type: Boolean,\n      default: false\n    },\n    // Default font size of the labels in px\n    fontSize: {\n      type: Number,\n      default: 11\n    },\n    // Default padding within the items in px\n    padding: {\n      type: Number,\n      default: 3\n    },\n    // Default minimum width of items\n    minWidth: {\n      type: Number,\n      default: 44\n    },\n    // Height of the toolbar in px\n    height: {\n      type: Number\n    }\n  },\n\n  computed: {\n    toolbarStyle() {\n      if (this.height) {\n        return `height: ${this.height}px`;\n      }\n\n      return '';\n    }\n  },\n\n  render(createElement) {\n    let attrs = {\n      class: 'ev-toolbar d-flex h-100 flex-middle p-n-xs p-s-xs p-w-xs p-e-xs',\n      style: this.toolbarStyle\n    };\n\n    if (!this.$slots.default) {\n      return createElement('div', attrs);\n    }\n\n    for (const vnode of this.$slots.default) {\n      vnode.componentOptions.propsData = {\n        labelShow: this.labelShow,\n        iconPos: this.iconPos,\n        iconSize: this.iconSize,\n        fontSize: this.fontSize,\n        minWidth: this.minWidth,\n        padding: this.padding,\n        iconShow: this.iconShow,\n        ...vnode.componentOptions.propsData\n      };\n    }\n\n    return createElement('div', attrs, this.$slots.default);\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '@/../style/reset.scss';\n@import '@/../style/utilities.scss';\n\n.ev-toolbar {\n  user-select: none;\n}\n</style>\n"]}, media: undefined });

	  };
	  /* scoped */
	  const __vue_scope_id__$4 = "data-v-1e6336ec";
	  /* module identifier */
	  const __vue_module_identifier__$4 = undefined;
	  /* functional template */
	  const __vue_is_functional_template__$4 = undefined;
	  /* style inject SSR */
	  
	  /* style inject shadow dom */
	  

	  
	  const __vue_component__$4 = /*#__PURE__*/normalizeComponent(
	    {},
	    __vue_inject_styles__$4,
	    __vue_script__$4,
	    __vue_scope_id__$4,
	    __vue_is_functional_template__$4,
	    __vue_module_identifier__$4,
	    false,
	    createInjector,
	    undefined,
	    undefined
	  );

	__vue_component__$4.install = function(Vue) {
	  Vue.component(__vue_component__$4.name, __vue_component__$4);
	};

	//

	var script$5 = {
	  name: 'EvToolbarItem',

	  components: {
	    EvIcon: __vue_component__$1
	  },

	  props: {
	    // Name of EvIcon to use for the icon
	    icon: String,
	    // Text to show above/aside icon
	    label: String,
	    // Text to display when hovering over item
	    tooltip: String,
	    // Whether the item is disabled and cannot receive clicks
	    disabled: Boolean,
	    // A menu item id to trigger when the item is clicked
	    menuId: String,
	    // Position of icon in relation to the label
	    iconPos: {
	      // `'above'`/`'aside'`
	      type: String,
	      default: 'above'
	    },
	    // Font size of the label in px
	    fontSize: {
	      type: Number,
	      default: 11
	    },
	    // Size of the icon in px
	    iconSize: {
	      type: Number,
	      default: 16
	    },
	    // Whether to display label
	    labelShow: {
	      type: Boolean,
	      default: false
	    },
	    // Whether to display an icon
	    iconShow: {
	      type: Boolean,
	      default: true
	    },
	    // Minimum width of item
	    minWidth: {
	      type: Number,
	      default: 44
	    },
	    // Padding within the item in px
	    padding: {
	      type: Number,
	      default: 3
	    }
	  },

	  computed: {
	    labelStyle() {
	      let style = {};

	      if (this.fontSize) {
	        style.fontSize = `${this.fontSize}px`;
	      }

	      return style;
	    },

	    itemStyle() {
	      let style = {
	        padding: `${this.padding}px`
	      };

	      if (this.minWidth) {
	        style.minWidth = `${this.minWidth}px`;
	      }

	      return style;
	    },

	    iconStyle() {
	      return `height: ${this.iconSize}px`;
	    },

	    labelClass() {
	      if (this.iconPos === 'aside') {
	        return 'p-w-xs';
	      }

	      if (this.iconShow) return 'p-n-xxs';

	      return '';
	    },

	    itemClass() {
	      let classes = 'flex-center flex-middle';

	      if (this.iconPos === 'above') {
	        classes += ' flex-vertical p-n-xs p-s-xs';
	      }

	      if (this.menuItem) {
	        classes += ` ev-toolbar-item-${this.menuItem.id}`;

	        if (this.menuItem.enabled === false) {
	          classes += ' ev-disabled';
	        }

	        if (this.menuItem.checked === true) {
	          classes += ' ev-selected';
	        }
	      }

	      return classes;
	    },

	    menuItem() {
	      if (!this.$evmenu) return {};

	      return this.$evmenu.get(this.menuId) || {};
	    }
	  },

	  methods: {
	    handleClick() {
	      this.$emit('click');

	      if (!this.$evmenu) return;

	      let menuItem = this.$evmenu.get(this.menuId);

	      if (menuItem) {
	        if (menuItem.type === 'radio') {
	          menuItem.lastChecked = true;
	          menuItem.checked = true;
	        }

	        if (menuItem.type === 'checkbox') {
	          menuItem.checked = !menuItem.checked;
	        }

	        this.$evmenu.$emit(`input:${this.menuId}`, menuItem);
	        this.$evmenu.$emit('input', menuItem);
	        electron.ipcRenderer.send('evmenu:ipc:click', menuItem);
	      }
	    }
	  }
	};

	/* script */
	const __vue_script__$5 = script$5;

	/* template */
	var __vue_render__$4 = function() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c(
	    "div",
	    {
	      staticClass: "ev-toolbar-item d-flex h-100 m-e-xs",
	      class: _vm.itemClass,
	      style: _vm.itemStyle,
	      attrs: { title: _vm.tooltip },
	      on: { click: _vm.handleClick }
	    },
	    [
	      _vm.iconShow
	        ? _c("ev-icon", {
	            staticClass: "h-100",
	            style: _vm.iconStyle,
	            attrs: { name: _vm.icon }
	          })
	        : _vm._e(),
	      _vm._v(" "),
	      _vm.labelShow
	        ? _c("label", { class: _vm.labelClass, style: _vm.labelStyle }, [
	            _vm._v("\n    " + _vm._s(_vm.label) + "\n  ")
	          ])
	        : _vm._e()
	    ],
	    1
	  )
	};
	var __vue_staticRenderFns__$4 = [];
	__vue_render__$4._withStripped = true;

	  /* style */
	  const __vue_inject_styles__$5 = function (inject) {
	    if (!inject) return
	    inject("data-v-b2993b96_0", { source: "*[data-v-b2993b96] {\n  box-sizing: border-box;\n}\n*[data-v-b2993b96]:before,\n*[data-v-b2993b96]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-b2993b96] {\n  height: 100%;\n}\n.vh-100[data-v-b2993b96] {\n  height: 100vh;\n}\n.w-100[data-v-b2993b96] {\n  width: 100%;\n}\n.vw-100[data-v-b2993b96] {\n  width: 100vw;\n}\n.pre-line[data-v-b2993b96] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-b2993b96] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-b2993b96] {\n  white-space: nowrap;\n}\n.d-block[data-v-b2993b96] {\n  display: block;\n}\n.d-inline-block[data-v-b2993b96] {\n  display: inline-block;\n}\n.d-flex[data-v-b2993b96] {\n  display: flex;\n}\n.d-inline-flex[data-v-b2993b96] {\n  display: inline-flex;\n}\n.d-grid[data-v-b2993b96] {\n  display: grid;\n}\n.d-none[data-v-b2993b96] {\n  display: none;\n}\n.hide[data-v-b2993b96] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-b2993b96] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-b2993b96] {\n  overflow: auto;\n}\n.flex-center[data-v-b2993b96] {\n  justify-content: center;\n}\n.flex-middle[data-v-b2993b96] {\n  align-items: center;\n}\n.flex-grow[data-v-b2993b96] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-b2993b96] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-b2993b96] {\n  flex-direction: column;\n}\n.flex-space[data-v-b2993b96] {\n  justify-content: space-between;\n}\n.flex-end[data-v-b2993b96] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-b2993b96] {\n  justify-content: flex-start;\n}\n.text-center[data-v-b2993b96] {\n  text-align: center;\n}\n.m-z[data-v-b2993b96] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-b2993b96] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-b2993b96] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-b2993b96] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-b2993b96] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-b2993b96] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-b2993b96] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-b2993b96] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-b2993b96] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-b2993b96] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-b2993b96] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-b2993b96] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-b2993b96] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-b2993b96] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-b2993b96] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-b2993b96] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-b2993b96] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-b2993b96] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-b2993b96] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-b2993b96] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-b2993b96] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-b2993b96] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-b2993b96] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-b2993b96] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-b2993b96] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-b2993b96] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-b2993b96] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-b2993b96] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-b2993b96] {\n  margin-left: 2px;\n}\n.p-z[data-v-b2993b96] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-b2993b96] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-b2993b96] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-b2993b96] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-b2993b96] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-b2993b96] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-b2993b96] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-b2993b96] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-b2993b96] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-b2993b96] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-b2993b96] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-b2993b96] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-b2993b96] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-b2993b96] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-b2993b96] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-b2993b96] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-b2993b96] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-b2993b96] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-b2993b96] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-b2993b96] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-b2993b96] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-b2993b96] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-b2993b96] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-b2993b96] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-b2993b96] {\n  padding-left: 5px;\n}\n.p-xs[data-v-b2993b96] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-b2993b96] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-b2993b96] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-b2993b96] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-b2993b96] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-b2993b96] {\n  padding: 2px;\n}\n.p-xs[data-v-b2993b96] {\n  padding: 5px;\n}\n.p-sm[data-v-b2993b96] {\n  padding: 10px;\n}\n.p-med[data-v-b2993b96] {\n  padding: 15px;\n}\n.p-lg[data-v-b2993b96] {\n  padding: 20px;\n}\n.p-xl[data-v-b2993b96] {\n  padding: 25px;\n}\n.m-xxs[data-v-b2993b96] {\n  margin: 2px;\n}\n.m-xs[data-v-b2993b96] {\n  margin: 5px;\n}\n.m-sm[data-v-b2993b96] {\n  margin: 10px;\n}\n.m-med[data-v-b2993b96] {\n  margin: 15px;\n}\n.m-lg[data-v-b2993b96] {\n  margin: 20px;\n}\n.m-xl[data-v-b2993b96] {\n  margin: 25px;\n}\n.ev-toolbar-item[data-v-b2993b96] {\n  user-select: none;\n}\n.ev-toolbar-item label[data-v-b2993b96] {\n  line-height: 1.15;\n}\n.ev-toolbar-item[data-v-b2993b96]:active, .ev-toolbar-item.ev-active[data-v-b2993b96] {\n  transform: scale(0.94);\n}\n.ev-toolbar-item.ev-disabled[data-v-b2993b96] {\n  pointer-events: none;\n  opacity: 0.5;\n}\n\n/*# sourceMappingURL=EvToolbarItem.vue.map */", map: {"version":3,"sources":["EvToolbarItem.vue","/Users/john/Code/evwt/packages/EvToolbarItem/src/EvToolbarItem.vue"],"names":[],"mappings":"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","file":"EvToolbarItem.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-toolbar-item {\n  user-select: none;\n}\n.ev-toolbar-item label {\n  line-height: 1.15;\n}\n.ev-toolbar-item:active, .ev-toolbar-item.ev-active {\n  transform: scale(0.94);\n}\n.ev-toolbar-item.ev-disabled {\n  pointer-events: none;\n  opacity: 0.5;\n}\n\n/*# sourceMappingURL=EvToolbarItem.vue.map */","<template>\n  <div\n    class=\"ev-toolbar-item d-flex h-100 m-e-xs\"\n    :title=\"tooltip\"\n    :class=\"itemClass\"\n    :style=\"itemStyle\"\n    @click=\"handleClick\">\n    <ev-icon v-if=\"iconShow\" class=\"h-100\" :name=\"icon\" :style=\"iconStyle\" />\n    <label v-if=\"labelShow\" :class=\"labelClass\" :style=\"labelStyle\">\n      {{ label }}\n    </label>\n  </div>\n</template>\n\n<script>\nimport { ipcRenderer } from 'electron';\nimport EvIcon from '../../EvIcon';\n\nexport default {\n  name: 'EvToolbarItem',\n\n  components: {\n    EvIcon\n  },\n\n  props: {\n    // Name of EvIcon to use for the icon\n    icon: String,\n    // Text to show above/aside icon\n    label: String,\n    // Text to display when hovering over item\n    tooltip: String,\n    // Whether the item is disabled and cannot receive clicks\n    disabled: Boolean,\n    // A menu item id to trigger when the item is clicked\n    menuId: String,\n    // Position of icon in relation to the label\n    iconPos: {\n      // `'above'`/`'aside'`\n      type: String,\n      default: 'above'\n    },\n    // Font size of the label in px\n    fontSize: {\n      type: Number,\n      default: 11\n    },\n    // Size of the icon in px\n    iconSize: {\n      type: Number,\n      default: 16\n    },\n    // Whether to display label\n    labelShow: {\n      type: Boolean,\n      default: false\n    },\n    // Whether to display an icon\n    iconShow: {\n      type: Boolean,\n      default: true\n    },\n    // Minimum width of item\n    minWidth: {\n      type: Number,\n      default: 44\n    },\n    // Padding within the item in px\n    padding: {\n      type: Number,\n      default: 3\n    }\n  },\n\n  computed: {\n    labelStyle() {\n      let style = {};\n\n      if (this.fontSize) {\n        style.fontSize = `${this.fontSize}px`;\n      }\n\n      return style;\n    },\n\n    itemStyle() {\n      let style = {\n        padding: `${this.padding}px`\n      };\n\n      if (this.minWidth) {\n        style.minWidth = `${this.minWidth}px`;\n      }\n\n      return style;\n    },\n\n    iconStyle() {\n      return `height: ${this.iconSize}px`;\n    },\n\n    labelClass() {\n      if (this.iconPos === 'aside') {\n        return 'p-w-xs';\n      }\n\n      if (this.iconShow) return 'p-n-xxs';\n\n      return '';\n    },\n\n    itemClass() {\n      let classes = 'flex-center flex-middle';\n\n      if (this.iconPos === 'above') {\n        classes += ' flex-vertical p-n-xs p-s-xs';\n      }\n\n      if (this.menuItem) {\n        classes += ` ev-toolbar-item-${this.menuItem.id}`;\n\n        if (this.menuItem.enabled === false) {\n          classes += ' ev-disabled';\n        }\n\n        if (this.menuItem.checked === true) {\n          classes += ' ev-selected';\n        }\n      }\n\n      return classes;\n    },\n\n    menuItem() {\n      if (!this.$evmenu) return {};\n\n      return this.$evmenu.get(this.menuId) || {};\n    }\n  },\n\n  methods: {\n    handleClick() {\n      this.$emit('click');\n\n      if (!this.$evmenu) return;\n\n      let menuItem = this.$evmenu.get(this.menuId);\n\n      if (menuItem) {\n        if (menuItem.type === 'radio') {\n          menuItem.lastChecked = true;\n          menuItem.checked = true;\n        }\n\n        if (menuItem.type === 'checkbox') {\n          menuItem.checked = !menuItem.checked;\n        }\n\n        this.$evmenu.$emit(`input:${this.menuId}`, menuItem);\n        this.$evmenu.$emit('input', menuItem);\n        ipcRenderer.send('evmenu:ipc:click', menuItem);\n      }\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '@/../style/reset.scss';\n@import '@/../style/utilities.scss';\n\n.ev-toolbar-item {\n  user-select: none;\n\n  label {\n    line-height: 1.15;\n  }\n\n  &:active,\n  &.ev-active {\n    transform: scale(0.94);\n  }\n\n  &.ev-disabled {\n    pointer-events: none;\n    opacity: 0.5;\n  }\n}\n</style>\n"]}, media: undefined });

	  };
	  /* scoped */
	  const __vue_scope_id__$5 = "data-v-b2993b96";
	  /* module identifier */
	  const __vue_module_identifier__$5 = undefined;
	  /* functional template */
	  const __vue_is_functional_template__$5 = false;
	  /* style inject SSR */
	  
	  /* style inject shadow dom */
	  

	  
	  const __vue_component__$5 = /*#__PURE__*/normalizeComponent(
	    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
	    __vue_inject_styles__$5,
	    __vue_script__$5,
	    __vue_scope_id__$5,
	    __vue_is_functional_template__$5,
	    __vue_module_identifier__$5,
	    false,
	    createInjector,
	    undefined,
	    undefined
	  );

	__vue_component__$5.install = function(Vue) {
	  Vue.component(__vue_component__$5.name, __vue_component__$5);
	};

	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//

	var script$6 = {
	  props: {
	    // Array of objects with your data
	    items: {
	      type: Array,
	      required: true
	    },
	    // Unique identifying field within each item object
	    keyField: {
	      type: String,
	      default: 'id'
	    },
	    // The height of each item
	    rowHeight: {
	      type: Number,
	      default: 18
	    }
	  },

	  data() {
	    return {
	      rootHeight: window.innerHeight,
	      scrollTop: 0,
	      nodePadding: 10
	    };
	  },

	  computed: {
	    viewportHeight() {
	      return this.itemCount * this.rowHeight;
	    },

	    startIndex() {
	      let startNode = Math.floor(this.scrollTop / this.rowHeight) - this.nodePadding;
	      startNode = Math.max(0, startNode);
	      return startNode;
	    },

	    visibleNodeCount() {
	      let count = Math.ceil(this.rootHeight / this.rowHeight) + 2 * this.nodePadding;
	      count = Math.min(this.itemCount - this.startIndex, count);
	      return count;
	    },

	    visibleItems() {
	      return this.items.slice(
	        this.startIndex,
	        this.startIndex + this.visibleNodeCount
	      );
	    },

	    itemCount() {
	      return this.items.length;
	    },

	    offsetY() {
	      return this.startIndex * this.rowHeight;
	    },

	    spacerStyle() {
	      return {
	        transform: `translateY(${this.offsetY}px)`
	      };
	    },

	    viewportStyle() {
	      return {
	        overflow: 'hidden',
	        height: `${this.viewportHeight}px`,
	        position: 'relative'
	      };
	    },

	    rootStyle() {
	      return {
	        height: `${this.rootHeight}px`,
	        overflow: 'auto'
	      };
	    },

	    itemStyle() {
	      return {
	        height: `${this.rowHeight}px`
	      };
	    }
	  },

	  mounted() {
	    this.$refs.root.addEventListener(
	      'scroll',
	      this.handleScroll,
	      { passive: true }
	    );

	    this.observeSize();
	  },

	  beforeDestroy() {
	    this.$refs.root.removeEventListener('scroll', this.handleScroll);
	  },

	  methods: {
	    handleScroll() {
	      this.scrollTop = this.$refs.root.scrollTop;
	    },

	    observeSize() {
	      let rootSizeObserver = new ResizeObserver(entries => {
	        for (let entry of entries) {
	          let { contentRect } = entry;
	          this.rootHeight = contentRect.height;
	        }
	      });

	      rootSizeObserver.observe(this.$refs.root.parentElement);
	    }
	  }
	};

	/* script */
	const __vue_script__$6 = script$6;

	/* template */
	var __vue_render__$5 = function() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c("div", { ref: "root", staticClass: "root", style: _vm.rootStyle }, [
	    _c(
	      "div",
	      { ref: "viewport", staticClass: "viewport", style: _vm.viewportStyle },
	      [
	        _c(
	          "div",
	          { ref: "spacer", staticClass: "spacer", style: _vm.spacerStyle },
	          _vm._l(_vm.visibleItems, function(item) {
	            return _c(
	              "div",
	              { key: item[_vm.keyField], style: _vm.itemStyle },
	              [
	                _vm._t(
	                  "default",
	                  [_vm._v("\n          " + _vm._s(item) + "\n        ")],
	                  { item: item }
	                )
	              ],
	              2
	            )
	          }),
	          0
	        )
	      ]
	    )
	  ])
	};
	var __vue_staticRenderFns__$5 = [];
	__vue_render__$5._withStripped = true;

	  /* style */
	  const __vue_inject_styles__$6 = function (inject) {
	    if (!inject) return
	    inject("data-v-502cfb71_0", { source: ".root[data-v-502cfb71] {\n  min-height: 100%;\n}\n.viewport[data-v-502cfb71] {\n  overflow-y: auto;\n}\n\n/*# sourceMappingURL=EvVirtualScroll.vue.map */", map: {"version":3,"sources":["/Users/john/Code/evwt/packages/EvVirtualScroll/src/EvVirtualScroll.vue","EvVirtualScroll.vue"],"names":[],"mappings":"AAyIA;EACA,gBAAA;ACxIA;AD2IA;EACA,gBAAA;ACxIA;;AAEA,8CAA8C","file":"EvVirtualScroll.vue","sourcesContent":["<template>\n  <div ref=\"root\" class=\"root\" :style=\"rootStyle\">\n    <div ref=\"viewport\" class=\"viewport\" :style=\"viewportStyle\">\n      <div ref=\"spacer\" class=\"spacer\" :style=\"spacerStyle\">\n        <div v-for=\"item in visibleItems\" :key=\"item[keyField]\" :style=\"itemStyle\">\n          <!-- Slot for your item component. Slot scope of `item` available with item properties. -->\n          <slot :item=\"item\">\n            {{ item }}\n          </slot>\n        </div>\n      </div>\n    </div>\n  </div>\n</template>\n\n<script>\nexport default {\n  props: {\n    // Array of objects with your data\n    items: {\n      type: Array,\n      required: true\n    },\n    // Unique identifying field within each item object\n    keyField: {\n      type: String,\n      default: 'id'\n    },\n    // The height of each item\n    rowHeight: {\n      type: Number,\n      default: 18\n    }\n  },\n\n  data() {\n    return {\n      rootHeight: window.innerHeight,\n      scrollTop: 0,\n      nodePadding: 10\n    };\n  },\n\n  computed: {\n    viewportHeight() {\n      return this.itemCount * this.rowHeight;\n    },\n\n    startIndex() {\n      let startNode = Math.floor(this.scrollTop / this.rowHeight) - this.nodePadding;\n      startNode = Math.max(0, startNode);\n      return startNode;\n    },\n\n    visibleNodeCount() {\n      let count = Math.ceil(this.rootHeight / this.rowHeight) + 2 * this.nodePadding;\n      count = Math.min(this.itemCount - this.startIndex, count);\n      return count;\n    },\n\n    visibleItems() {\n      return this.items.slice(\n        this.startIndex,\n        this.startIndex + this.visibleNodeCount\n      );\n    },\n\n    itemCount() {\n      return this.items.length;\n    },\n\n    offsetY() {\n      return this.startIndex * this.rowHeight;\n    },\n\n    spacerStyle() {\n      return {\n        transform: `translateY(${this.offsetY}px)`\n      };\n    },\n\n    viewportStyle() {\n      return {\n        overflow: 'hidden',\n        height: `${this.viewportHeight}px`,\n        position: 'relative'\n      };\n    },\n\n    rootStyle() {\n      return {\n        height: `${this.rootHeight}px`,\n        overflow: 'auto'\n      };\n    },\n\n    itemStyle() {\n      return {\n        height: `${this.rowHeight}px`\n      };\n    }\n  },\n\n  mounted() {\n    this.$refs.root.addEventListener(\n      'scroll',\n      this.handleScroll,\n      { passive: true }\n    );\n\n    this.observeSize();\n  },\n\n  beforeDestroy() {\n    this.$refs.root.removeEventListener('scroll', this.handleScroll);\n  },\n\n  methods: {\n    handleScroll() {\n      this.scrollTop = this.$refs.root.scrollTop;\n    },\n\n    observeSize() {\n      let rootSizeObserver = new ResizeObserver(entries => {\n        for (let entry of entries) {\n          let { contentRect } = entry;\n          this.rootHeight = contentRect.height;\n        }\n      });\n\n      rootSizeObserver.observe(this.$refs.root.parentElement);\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n.root {\n  min-height: 100%;\n}\n\n.viewport {\n  overflow-y: auto;\n}\n</style>\n",".root {\n  min-height: 100%;\n}\n\n.viewport {\n  overflow-y: auto;\n}\n\n/*# sourceMappingURL=EvVirtualScroll.vue.map */"]}, media: undefined });

	  };
	  /* scoped */
	  const __vue_scope_id__$6 = "data-v-502cfb71";
	  /* module identifier */
	  const __vue_module_identifier__$6 = undefined;
	  /* functional template */
	  const __vue_is_functional_template__$6 = false;
	  /* style inject SSR */
	  
	  /* style inject shadow dom */
	  

	  
	  const __vue_component__$6 = /*#__PURE__*/normalizeComponent(
	    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
	    __vue_inject_styles__$6,
	    __vue_script__$6,
	    __vue_scope_id__$6,
	    __vue_is_functional_template__$6,
	    __vue_module_identifier__$6,
	    false,
	    createInjector,
	    undefined,
	    undefined
	  );

	__vue_component__$6.install = function(Vue) {
	  Vue.component(__vue_component__$6.name, __vue_component__$6);
	};

	exports.EvContextMenu = EvContextMenu;
	exports.EvDropZone = __vue_component__;
	exports.EvIcon = __vue_component__$1;
	exports.EvLayout = __vue_component__$3;
	exports.EvMenu = EvMenu;
	exports.EvStore = EvStore;
	exports.EvToolbar = __vue_component__$4;
	exports.EvToolbarItem = __vue_component__$5;
	exports.EvVirtualScroll = __vue_component__$6;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
