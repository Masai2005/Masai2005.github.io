// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://masai2005.github.io',
  base: '/portfolio-master',
  vite: {
    plugins: [tailwindcss()]
  }
});