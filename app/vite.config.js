import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwind from '@tailwindcss/vite';

// The kata markdown lives at <repo>/katas, one level above this app dir, so the
// dev server needs filesystem access to the parent directory.
export default defineConfig({
  plugins: [solid(), tailwind()],
  server: {
    fs: { allow: ['..'] },
  },
});
