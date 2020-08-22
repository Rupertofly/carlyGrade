<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    GraphData,
    GraphSim,
    LinkData,
    inputData,
    VPoint,
  } from './types';
  import * as h from '@rupertofly/h';
  import * as d3 from 'd3';
  import { event as cEvent } from 'd3-selection';
  import { fade } from 'svelte/transition';
  import { SimulationNodeDatum, map } from 'd3';
  import { Delaunay } from 'd3-delaunay';
  import { aStar, mapIterator } from './astar';
  import { loop_guard } from 'svelte/internal';
  export let data: Array<GraphData> = [];
  export let links: Array<LinkData> = [];
  let forceSimulation: GraphSim;
  let svg: SVGSVGElement;
  let tformG: SVGGElement;
  let transform = d3.zoomIdentity;
  type opArr = inputData[];
  const sq3 = Math.sqrt(3);
  let fillPoints = d3.range(0, 100).map((i) => {
    const q = Math.floor(i / 10);
    const r = i % 10;
    const x = -50 + -q + 2 * (sq3 * q + (sq3 / 2) * r);
    const y = -50 + 2 * ((3 / 2) * r);
    return {
      x,
      y,
      index: i,
    };
  });
  interface Vector {
    x: number;
    y: number;
  }
  function constrain(n: number) {
    return n < -50 ? -50 : n > 50 ? 50 : n;
  }
  let outputData: opArr;
  let outputLinks: LinkData[];
  function sU() {
    const hasLink = new Map<number, boolean>();
    forceSimulation.tick();
    outputData = outputData.map((d) => {
      if (d.x! < -50 || d.x! > 50) {
        d.x = Math.sign(d.x!) * 50;
        d.vx = -1 * d.vx!;
      }
      if (d.y! < -50 || d.y! > 50) {
        d.y = Math.sign(d.y!) * 50;
        d.vy = -1 * d.vy!;
      }
      return d;
    });

    const graphPoints = [...outputData, ...fillPoints];

    const graph = Delaunay.from(
      graphPoints,
      (d) => d?.x || 0,
      (d) => d?.y || 0
    );
    const vor = graph.voronoi([-50, -50, 50, 50]);
    fillPoints = fillPoints.map((pt, i) => {
      const [cx, cy] = d3.polygonCentroid(
        vor.cellPolygon(outputData.length + i) as [number, number][]
      );
      pt.index = outputData.length + i;
      pt.x = cx;
      pt.y = cy;
      return pt;
    }) as VPoint[];
    outputLinks = outputLinks.map((link) => {
      const p = aStar(
        link.source as VPoint,
        link.target as VPoint,
        (d) =>
          mapIterator(
            graph.neighbors(d.index),
            (i) => graphPoints[i] as VPoint
          ),
        (a, b) => {
          const nextLink = hasLink.has(b.index);
          const onLink = hasLink.has(a.index);
          if (b.index < outputData.length) return 100;
          if (nextLink && onLink) return 50;
          if (nextLink) return 10;
          return 1;
        }
      );
      for (let { index } of p) hasLink.set(index, true);
      if (p.length <= 0) return link;
      const path = d3.path();

      h.drawLoop(
        p.map((d) => [d.x, d.y]),
        false,
        path
      );
      link.path = path.toString();
      return link;
    });
  }

  // Setup Zoom and Drag
  function setupInteraction() {
    // Zoom
    function zoomed() {
      transform = cEvent.transform;
      sU();
    }
    const zoom = d3
      .zoom<SVGSVGElement, any>()
      .scaleExtent([0.25, 2])
      .translateExtent([
        [-200, -200],
        [200, 200],
      ])
      .on('zoom', zoomed);

    function dSubj() {
      const nd = forceSimulation.find(
        transform.invertX(cEvent.x),
        transform.invertY(cEvent.y),
        1.5
      );
      if (nd) {
        nd.x = transform.applyX(nd.x!);
        nd.y = transform.applyY(nd.y!);
      }
      return nd;
    }
    function dragstarted() {
      if (!cEvent.active) forceSimulation.alphaTarget(0.3).restart();
      cEvent.subject.fx = transform.invertX(cEvent.subject.x);
      cEvent.subject.fy = transform.invertY(cEvent.subject.y);
      cEvent.subject.vx = 0;
      cEvent.subject.vy = 0;
    }
    function dragged() {
      cEvent.subject.fx = transform.invertX(cEvent.x);
      cEvent.subject.fy = transform.invertY(cEvent.y);
    }
    function dragended() {
      if (!cEvent.active) forceSimulation.alphaTarget(0);
      cEvent.subject.fx = undefined;
      cEvent.subject.fy = undefined;
    }
    const drag: d3.DragBehavior<SVGSVGElement, any, any> = d3
      .drag<SVGSVGElement, any>()
      .container(svg)
      .subject(dSubj)
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
    d3.select(svg).call(drag).call(zoom);
  }

  function mergeGraphData(
    d: GraphData,
    sourceArr: (d3.SimulationNodeDatum & GraphData)[]
  ) {
    if (!sourceArr.some((f) => f.id === d.id))
      return Object.create(d) as d3.SimulationNodeDatum & GraphData;
    return Object.assign(sourceArr.find((f) => f.id === d.id)!, d);
  }

  function updateData(
    inputData: Array<GraphData>,
    inputLinks: Array<LinkData>
  ) {
    let sourceData = outputData ?? data.slice(0);
    function mergeDataCallback(data: GraphData) {
      return mergeGraphData(data, sourceData);
    }

    outputData = inputData.map(mergeDataCallback);
    outputLinks = links.map((o) => Object.create(o));
    forceSimulation = d3
      .forceSimulation(outputData)
      .alphaTarget(0.1)
      .force('charge', d3.forceManyBody().strength(-1))
      .force('friends', d3.forceManyBody().strength(1).distanceMin(50))
      .force('collide', d3.forceCollide(2))
      .force(
        'links',
        d3
          .forceLink<GraphData & SimulationNodeDatum, LinkData>()
          .id((n) => n.id)
          .links(outputLinks)
          .strength(0.002)
      )
      .force('centre', d3.forceCenter(0, 0))
      .on('tick', sU);
  }

  $: updateData(data, links);

  onMount(() => {
    // updateData(data);
    setupInteraction();
  });
</script>

<style>
  /* your styles go here */
</style>

<svg
  width={100}
  height={100}
  viewBox="-50 -50 100 100"
  {...$$restProps}
  bind:this={svg}>
  <g
    id="transform"
    bind:this={tformG}
    transform="translate({transform.x}
    {transform.y}) scale({transform.k}
    {transform.k})">
    <g class="links" stroke="#eee">
      {#each outputLinks as lk}
        <path transition:fade d={lk.path} fill="#0000" />
      {/each}
    </g>
    {#each outputData as dp (dp.id)}
      <circle
        transition:fade
        cx={dp.x}
        cy={dp.y}
        r={2}
        style="fill:{dp.colour};stroke:{d3
          .hsl(dp.colour)
          .brighter(0.4)
          .toString()}; stroke-width:0.75;" />
    {/each}
    <g />
  </g>
</svg>
<svelte:options />
