import * as s from 'svelte/store';
export const questionStore = s.writable({
  q: 'Run Away with Me or Fake Mona Lisa',
  a: 'Run Away with Me',
  b: 'Fake Mona Lisa',
});
