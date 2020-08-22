import type * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';
export interface inputData extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  colour: string;
}
interface Vector {
  x: number;
  y: number;
}
export interface VPoint extends Vector {
  index: number;
}
export interface LinkData extends d3.SimulationLinkDatum<inputData> {
  path?: string;
}

export type GraphSim = d3.Simulation<
  d3.SimulationNodeDatum & inputData,
  d3.SimulationLinkDatum<inputData & SimulationNodeDatum> & LinkData
>;
export type GraphData = inputData & d3.SimulationNodeDatum;
