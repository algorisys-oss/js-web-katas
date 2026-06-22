import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwind from '@tailwindcss/vite';

// The kata markdown lives at <repo>/katas, one level above this app dir, so the
// dev server needs filesystem access to the parent directory.
// VITE_BASE lets the gh-pages deploy script build with a project-site base path
// (e.g. "/js-web-katas/"). Defaults to "/" for local dev.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [solid(), tailwind()],
  server: {
    fs: { allow: ['..'] },
  },
});
