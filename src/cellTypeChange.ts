import { VPoint, inputData } from './types';
import { rollup } from 'd3-array';
type celltype = VPoint | inputData;
function isInputData(inp: celltype): inp is inputData {
  return (inp as inputData).colour != undefined;
}
export function cellUpdate(
  cell: celltype,
  points: celltype[],
  neighbouriterator: IterableIterator<number>
): number {
  const tp = cell.type;

  if (isInputData(cell)) return cell.type;
  let neighbours = 0;
  const inpPoints: number[] = [];
  const neighbouringTypes: number[] = [];

  for (const nb of neighbouriterator) {
    neighbours++;
    const thisNb = points[nb];

    if (thisNb.type === 0) continue;
    if (isInputData(thisNb)) {
      if (!inpPoints.includes(thisNb.type)) inpPoints.push(thisNb.type);
    }
    neighbouringTypes.push(thisNb.type);
  }
  if (inpPoints.length > 0) {
    if (inpPoints.length > 1) return 0;

    return inpPoints[0];
  }
  if (tp !== 0) {
    if (neighbouringTypes.length < 1) return 0;
    if (neighbouringTypes.filter((t) => t === tp).length < neighbours / 3)
      return 0;

    return tp;
  }
  if (tp === 0 && neighbouringTypes.length < 1) return 0;
  const sortedNbs = Array.from(
    rollup(
      neighbouringTypes,
      (ar) => ar.length,
      (n) => n
    ).entries()
  ).sort((a, b) => b[1] - a[1]);

  if (sortedNbs[0][1] / neighbours > 0.75) return sortedNbs[0][0];

  return cell.type;
}
