<script lang="ts">
  import { onMount } from 'svelte';
  import type { GraphSim, LinkData, inputData, VPoint } from './types';
  import { cellUpdate } from './cellTypeChange';
  import * as vr from '@rupertofly/voronoi-regions';
  import * as h from '@rupertofly/h';
  import * as d3 from 'd3';
  import { event as cEvent } from 'd3-selection';
  import { fade, draw, crossfade } from 'svelte/transition';
  import { SimulationNodeDatum, map } from 'd3';
  import { Delaunay } from 'd3-delaunay';
  import { aStar, mapIterator } from './astar';
  import { loop_guard } from 'svelte/internal';
  export let data: Array<inputData> = [];
  export let links: Array<LinkData> = [];
  let forceSimulation: GraphSim;
  let svg: SVGSVGElement;
  let tformG: SVGGElement;
  let transform = d3.zoomIdentity;
  type opArr = inputData[];
  const sq3 = Math.sqrt(3);
  let fillPoints = d3.range(0, 324).map((i) => {
    const q = Math.floor(i / 18);
    const r = i % 18;
    const x = -50 + -q + 2 * (sq3 * q + (sq3 / 2) * r);
    const y = -50 + 2 * ((3 / 2) * r);
    return {
      x,
      y,
      index: i,
      type: 0,
    };
  });
  interface Vector {
    x: number;
    y: number;
  }
  function constrain(n: number) {
    return n < -50 ? -50 : n > 50 ? 50 : n;
  }
  let redrawLines = false;
  let outputData: opArr;
  let outputLinks: LinkData[];
  let regis: { type: number; path: string }[] = [];
  let frames = 0;
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

    const graphPoints: VPoint[] = [...outputData, ...fillPoints] as any;

    const graph = Delaunay.from(
      graphPoints,
      (d) => d?.x || 0,
      (d) => d?.y || 0
    );
    const newTypes = graphPoints.map((pt, i) =>
      cellUpdate(pt, graphPoints, graph.neighbors(i))
    );
    const vor = graph.voronoi([-50, -50, 50, 50]);
    const myReg = vr.voronoiRegions<VPoint, number>(
      vor,
      graphPoints,
      (d) => d.type
    );
    regis = Array.from(myReg)
      .map((r) => {
        if (r.region.type < 1) return false;
        if (
          ![...r.region.members.values()].some((d) => d < outputData.length)
        ) {
          for (let i of r.region.members) {
            newTypes[i] = 0;
          }
          return false;
        }
        const pth = d3.path();
        h.drawShape(
          r.shape.map((lp) => {
            let ed = 3;
            if (lp.length < 4) ed = 2;
            return Array.from(h.spline(lp, ed, true, lp.length * 5));
          }),
          pth
        );
        return {
          type: r.region.type,
          path: pth.toString(),
        }!;
      })
      .filter((d) => d !== false) as { type: number; path: string }[];
    fillPoints = fillPoints.map((pt, i) => {
      const [cx, cy] = d3.polygonCentroid(
        vor.cellPolygon(outputData.length + i) as [number, number][]
      );
      pt.index = outputData.length + i;
      pt.x = cx;
      pt.y = cy;
      pt.type = newTypes[pt.index];
      return pt;
    }) as VPoint[];
    if ((frames % 3 === 0 && forceSimulation?.alpha() > 0.1) || redrawLines) {
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
            if (b.index < outputData.length) return 1000;
            if (nextLink && onLink) return 20;
            if (nextLink) return 5;
            if (
              (b.type !== link.source.type || b.type !== link.target.type) &&
              b.type > 0
            )
              return 3;
            return 1;
          }
        );
        for (let { index } of p) hasLink.set(index, true);
        if (p.length <= 0) return link;
        const path = d3.path();

        h.drawLoop(
          p.length > 4
            ? h.spline(
                p.map((pt) => [pt.x, pt.y] as [number, number]),
                4,
                false,
                p.length * 6
              )
            : p.map((pt) => [pt.x, pt.y] as [number, number]),
          false,
          path
        );
        link.path = path.toString();
        return link;
      });
      redrawLines = false;
    }
    frames = frames + 1;
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
    d: inputData,
    sourceArr: (d3.SimulationNodeDatum & inputData)[]
  ) {
    if (!sourceArr.some((f) => f.id === d.id))
      return Object.create(d) as d3.SimulationNodeDatum & inputData;
    return Object.assign(sourceArr.find((f) => f.id === d.id)!, d);
  }

  function updateData(
    inputData: Array<inputData>,
    inputLinks: Array<LinkData>
  ) {
    let sourceData = outputData ?? data.slice(0);
    function mergeDataCallback(data: inputData) {
      return mergeGraphData(data, sourceData);
    }

    outputData = inputData.map(mergeDataCallback);
    outputLinks = links.map((o) => Object.create(o));
    const oldAlpha = forceSimulation?.alpha() ?? -1;
    if (forceSimulation) forceSimulation.on('tick', null);

    forceSimulation = d3
      .forceSimulation(outputData)
      .alphaTarget(0.1)
      .force('charge', d3.forceManyBody().strength(-0.8))
      .force('friends', d3.forceManyBody().strength(1).distanceMin(50))
      .force('collide', d3.forceCollide(2))
      .force(
        'links',
        d3
          .forceLink<inputData & SimulationNodeDatum, LinkData>()
          .id((n) => n.id)
          .links(outputLinks)
          .strength(0.01)
      );
    if (!forceSimulation.on('tick')) {
      forceSimulation.on('tick', sU);
    }
    if (oldAlpha >= 0) forceSimulation.alpha(oldAlpha);
    redrawLines = true;
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
  <defs>
    <filter id="shadow">
      <feDropShadow
        dx="0.2"
        dy="0.4"
        stdDeviation="0.2"
        flood-colour="#333"
        flood-opacity="0.1" />
    </filter>
  </defs>
  <g
    id="transform"
    bind:this={tformG}
    transform="translate({transform.x}
    {transform.y}) scale({transform.k}
    {transform.k})">
    <g id="regions">
      {#each regis as region}
        <path
          d={region.path}
          fill="hsl({region.type * 40},40%,75%)"
          stroke="hsl({region.type * 40},35%,80%)" />
      {/each}
    </g>
    <g class="links" stroke="#eee">
      {#each outputLinks as lk (lk.id)}
        {#if lk.path}
          <path
            transition:draw
            d={lk.path}
            fill="transparent"
            style="filter: url(#shadow);"
            stroke={d3.interpolateLab(`hsl(${lk.source.type * 40},50%,85%)`, `hsl(${lk.target.type * 40},50%,85%)`)(0.5)} />
        {/if}
      {/each}
    </g>
    <g>
      {#each outputData as dp (dp.id)}
        <circle
          transition:fade
          cx={dp.x}
          cy={dp.y}
          r={2}
          style="fill: hsl({dp.type * 40},60%,65%);stroke:hsl({dp.type * 40},50%,85%);
          stroke-width:0.75;" />
      {/each}
    </g>

  </g>
</svg>
<svelte:options />
