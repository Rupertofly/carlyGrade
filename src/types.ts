import type * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';
export interface GraphData {
  id: string;
  name: string;
  colour: string;
}
export interface LinkData {
  source: string;
  target: string;
}
export type GraphSim = d3.Simulation<
  d3.SimulationNodeDatum & GraphData,
  d3.SimulationLinkDatum<GraphData & SimulationNodeDatum> & LinkData
>;
