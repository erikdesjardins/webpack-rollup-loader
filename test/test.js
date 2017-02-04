import path from 'path';
import test from 'ava';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';

async function fixture(t, entry) {
	const outputPath = path.join(__dirname, 'bundle.js');
	const compiler = webpack({
		entry: `${path.join(__dirname, '../index.js')}!${path.join(__dirname, 'src', 'fixtures', entry)}`,
		bail: true,
		output: {
			filename: outputPath
		},
		module: {
			loaders: [
				{ test: /exec\.js$/, loader: path.join(__dirname, '../index.js') }
			]
		}
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
