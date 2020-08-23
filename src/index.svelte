<script lang="typescript">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import Graph from './Graph.svelte';
  import Quest from './question.svelte';
  import { questionStore } from './store';
  import { randomUniform } from 'd3';
  import { LinkData } from './types';
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
  let links: LinkData[] = [];
  const rType = d3.randomUniform(1, 10);
  let kyle = d3.range(32).map((i) => {
    const type = Math.floor(rType());
    return {
      id: i.toString(),
      name: i.toString(),
      colour: `hsl(${type * 30},50%,70%)`,
      x: 0,
      y: 0,
      type,
    };
  });

  const nF = () => {
    const type = Math.floor(rType());
    kyle = [
      ...kyle,
      {
        id: kyle.length.toString(),
        colour: `hsl(${type * 30}, 30%, 50%)`,
        name: 'blue' + kyle.length,
        x: 0,
        y: 0,
        type: type,
      },
    ];
  };

  const addLink = () => {
    let sc = '0';
    let tg = '0';
    sc = Math.floor(randomUniform(0, kyle.length)()).toString();
    tg = Math.floor(randomUniform(0, kyle.length)()).toString();
    if (sc === tg) return;
    links = [
      ...links,
      { source: sc as any, target: tg as any, id: `${sc},${tg}` } as LinkData,
    ];
  };
</script>

<style>

</style>

<main>
  <Graph style="width: 100%; height: 100%" data={kyle} {links} />
  <h2>Which is better?</h2>
  <button label="peep" on:click={nF}>peep</button>
  <button label="poop" on:click={addLink}>poop</button>
  <Quest
    q={$questionStore.q}
    result={info}
    a={$questionStore.a}
    b={$questionStore.b} />

</main>
