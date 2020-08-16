(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.evwt = {}));
}(this, (function (exports) { 'use strict';

	// EVWT should be used by importing from evwt/components, evwt/plugins, or
	// evwt/background
	var index = {};

	exports.default = index;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
