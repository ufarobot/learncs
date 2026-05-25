import { defineConfig } from 'astro/config';

export default defineConfig({
  compressHTML: false,
  output: 'static',
  outDir: './dist',
  publicDir: './public',
  site: 'https://ufarobot.github.io/learncs/'
});
