/**
 * @author Erik Desjardins
 * See LICENSE file in root directory for full license.
 */

'use strict';

var path = require('path');
var importFresh = require('import-fresh');
// Rollup seems to have global state, so get a fresh instance for every run...
function getRollupInstance() {
	return importFresh('rollup');
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

	var entryId = this.resourcePath;

	getRollupInstance().rollup(Object.assign({}, options, {
		input: entryId,
		plugins: (options.plugins || []).concat({
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
	}))
	.then(function(bundle) {
		return bundle.generate({ format: 'es', sourcemap: true });
	})
	.then(function(result) {
		callback(null, result.code, result.map);
	}, function(err) {
		callback(err);
	});
};
