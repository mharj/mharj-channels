import {defineConfig} from 'tsdown';

export default defineConfig({
	entry: ['./src/index.ts'],
	tsconfig: './tsconfig.build.json',
	format: {
		esm: {
			target: ['es2020'],
		},
		cjs: {
			target: ['node20'],
		},
	},
	dts: true,
});
