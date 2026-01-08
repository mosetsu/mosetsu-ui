import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			edge: true
		}),
		alias: {
			$actions: './src/actions',
			$components: './src/components',
			$lib: './src/lib',
			$kyba: './src/lib/kyba',
			$stores: './src/stores',
			$utils: './src/utils'
		}
	}
};

export default config;
