import path from 'path';
import fs from 'fs';
import test from 'ava';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import commonjs from 'rollup-plugin-commonjs';

async function fixture(t, entry, options) {
	const entryPath = path.join(__dirname, 'src', 'fixtures', entry);
	const outputPath = path.join(__dirname, 'bundle.js');
	const compiler = webpack({
		entry: entryPath,
		bail: true,
		output: {
			filename: outputPath
		},
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

	t.is(
		mockFs.readFileSync(outputPath, 'utf8'),
		fs.readFileSync(path.join(__dirname, 'src', 'expected', entry), 'utf8')
	);
}

test('simple', fixture, 'simple.js');

test('plugins option', fixture, 'fileLoader.js', { plugins: [commonjs({ extensions: ['.js', '.jpg'] })] });

test('external option', fixture, 'external.js', { external: [path.join(__dirname, 'src', 'b.js')] });
