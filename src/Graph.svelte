<script lang="ts">
  import * as d3 from 'd3';
  import { xlink_attr } from 'svelte/internal';
  const sz = 300;
  const useD = (node: any, data: any) => (node.dta = data);
  const rnd = d3.randomNormal(sz / 2, sz / 8);
  let data = d3.range(128).map((i) => ({
    x: rnd(),
    y: rnd(),
    f: `hsl(${i * (360 / 127)}, 40%, 80%)`,
  }));
  setInterval(() => {
    data.forEach((_, i) => data[i].x++);
  }, 30);
</script>

<style>
  /* your styles go here */
</style>

<svg width={sz} height={sz}>
  {#each data as d}
    <circle cy={d.y} cx={d.x} fill={d.f} r={3} use:useD={d} />
  {/each}
</svg>
