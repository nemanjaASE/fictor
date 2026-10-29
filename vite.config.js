import { defineConfig } from 'vite';

export default defineConfig({
  // relativne putanje: radi i na GitHub Pages (https://korisnik.github.io/fictor/) i lokalno
  base: './',
  build: {
    outDir: 'dist',
    // PptxGenJS i docx su u posebnim delovima (export/load.js učitava ih tek na „Preuzmi“), pa važi
    // podrazumevana granica od 500 kB: upozorenje znači da je nešto veliko ponovo ušlo u početni paket
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
