import path from 'path';
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

	const fs = new MemoryFS();

	compiler.outputFileSystem = fs;

	await new Promise((resolve, reject) => {
		compiler.run((err, stats) => {
			err ? reject(err) : resolve(stats);
		});
	});

	t.snapshot(fs.readFileSync(outputPath, 'utf8'));
}

test('simple', fixture, 'simple.js');

test('plugins option', fixture, 'fileLoader.js', { plugins: [commonjs({ extensions: ['.js', '.jpg'] })] });
