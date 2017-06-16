import path from 'path';
import fs from 'fs';
import test from 'ava';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import commonjs from 'rollup-plugin-commonjs';

function normalize(string) {
	return string
		.replace(/(\r\n|\r|\n)/g, '\n')
		.trim();
}

async function fixture(t, entry, options) {
	const entryPath = path.join(__dirname, 'src', 'fixtures', entry);
	const compiler = webpack({
		entry: entryPath,
		bail: true,
		output: {
			path: '/',
			filename: 'bundle.js'
		},
		devtool: 'source-map',
		module: {
			rules: [{
				test: entryPath,
				use: [{
					loader: path.join(__dirname, '../index.js'),
					options,
				}]
			}],
		},
	});

	const mockFs = new MemoryFS();

	compiler.outputFileSystem = mockFs;

	await new Promise((resolve, reject) => {
		compiler.run((err, stats) => {
			err ? reject(err) : resolve(stats);
		});
	});

	/*
	const bundle = mockFs.readFileSync('/bundle.js', 'utf8');
	fs.writeFileSync(path.join(__dirname, 'src', 'expected', entry), bundle);
	const sourcemap = mockFs.readFileSync('/bundle.js.map', 'utf8');
	fs.writeFileSync(path.join(__dirname, 'src', 'expected', `${entry}.map`), sourcemap);
	*/

	t.is(
		normalize(mockFs.readFileSync('/bundle.js', 'utf8')),
		normalize(fs.readFileSync(path.join(__dirname, 'src', 'expected', entry), 'utf8')),
	);

	t.is(
		normalize(mockFs.readFileSync('/bundle.js.map', 'utf8')),
		normalize(fs.readFileSync(path.join(__dirname, 'src', 'expected', `${entry}.map`), 'utf8')),
	);
}

test('simple', fixture, 'simple.js');

test('plugins option', fixture, 'fileLoader.js', { plugins: [commonjs({ extensions: ['.js', '.jpg'] })] });

test('external option', fixture, 'external.js', { external: [path.join(__dirname, 'src', 'b.js')] });
