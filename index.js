/**
 * @author Erik Desjardins
 * See LICENSE file in root directory for full license.
 */

'use strict';

var path = require('path');
var _rollup = require('rollup');

// Rollup seems to have global state,
// and so has strange behaviour when running multiple instances concurrently...
var locked = false;
var queue = [];

function dequeue() {
	if (queue.length) {
		locked = true;
		queue.shift()(_rollup).then(dequeue);
	} else {
		locked = false;
	}
}

function withRollupInstance(callback) {
	queue.push(callback);
	if (!locked) dequeue();
}

function splitRequest(request) {
	var inx = request.lastIndexOf('!');
	if (inx === -1) {
		return {
			loaders: '',
			resource: request
		};
	} else {
		return {
			loaders: request.slice(0, inx + 1),
			resource: request.slice(inx + 1)
		};
	}
}

module.exports = function(source, sourceMap) {
	var callback = this.async();

	var options = this.query || {};
	var plugins = options.plugins || [];
	var external = options.external || [];

	var entryId = this.resourcePath;

	withRollupInstance(function(rollup) {
		return rollup
			.rollup({
				entry: entryId,
				external: external,
				plugins: plugins.concat({
					resolveId: function(id, importerId) {
						if (id === entryId) {
							return entryId;
						} else {
							return new Promise(function(resolve, reject) {
								// split apart resource paths because Webpack's this.resolve() can't handle `loader!` prefixes
								var parts = splitRequest(id);
								var importerParts = splitRequest(importerId);

								// resolve the full path of the imported file with Webpack's module loader
								// this will figure out node_modules imports, Webpack aliases, etc.
								this.resolve(path.dirname(importerParts.resource), parts.resource, function(err, fullPath) {
									if (err) {
										reject(err);
									} else {
										resolve(parts.loaders + fullPath);
									}
								});
							}.bind(this));
						}
					}.bind(this),
					load: function(id) {
						if (id === entryId) {
							return { code: source, map: sourceMap };
						}
						return new Promise(function(resolve, reject) {
							// load the module with Webpack
							// this will apply all relevant loaders, etc.
							this.loadModule(id, function(err, source, map, module) {
								if (err) {
									reject(err);
									return;
								}
								resolve({ code: source, map: map });
							});
						}.bind(this));
					}.bind(this),
				})
			})
			.then(function(bundle) {
				var result = bundle.generate({ format: 'es', sourceMap: true });
				callback(null, result.code, result.map);
			}, function(err) {
				callback(err);
			});
	}.bind(this));
};
