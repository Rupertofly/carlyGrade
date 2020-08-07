import svelte from 'svelte';
import App from './index.svelte';
const app = new App({
  target: document.body,
});

(window as any).app = app;
export default app;
