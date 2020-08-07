<script lang="typescript">
  import { onMount } from 'svelte';
  import Quest from './question.svelte';
  import { questionStore } from './store';
  let ping: any;
  let info: any;
  const newFunction = async () => {
    await new Promise((res, rej) => {
      info = (t: string) => {
        console.log(t);
        res();
      };
    });
    const ll = document.querySelector('#ff');
    if (ll) ll.innerHTML = 'blag';
    $questionStore = { a: 'a2', b: 'b2', q: 'secondOne' };
  };
  onMount(newFunction);
</script>

<style>
  :root {
    background-color: #c2d8f2;
  }
  h1,
  h2 {
    font-family: 'Quicksand';
    color: #d34f73;
  }

  h3 {
    font-family: 'Work Sans';
    color: #d34f73;
  }
  p {
    font-family: 'Work Sans';
  }
  main {
    padding: 1.5em;
    margin-top: 8em;
    background-color: #f4f4f4;
    border-radius: 1em;
    border: 4px solid #fafafa;
    box-shadow: 0.25em 0.25em 0.5em #2c313755;
  }
</style>

<main>

  <h2>Which is better?</h2>
  <Quest
    q={$questionStore.q}
    result={info}
    a={$questionStore.a}
    b={$questionStore.b} />

</main>
