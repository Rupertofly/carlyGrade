import { PriorityQueue } from './PQ';

interface Vector {
  x: number;
  y: number;
}
function basicHeuristic<T extends Vector>(a: T, b: T) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
export function aStar<SRC>(
  start: SRC,
  end: SRC,
  neighbourFunction: (id: SRC) => Iterable<SRC>,
  costFunction: (a: SRC, b: SRC) => number
): SRC[] {
  const frontier = new PriorityQueue<SRC>();

  frontier.enqueue(start, 0);
  const previous = new Map<SRC, SRC | null>();
  const cost = new Map<SRC, number>();

  previous.set(start, null);
  cost.set(start, 0);
  while (frontier.length > 0) {
    const current = frontier.dequeue().element;

    if (current === end) break;
    for (const next of neighbourFunction(current)) {
      const newCost = (cost.get(current) ?? 0) + costFunction(current, next);

      if (!cost.has(next) || newCost < cost.get(next)!) {
        cost.set(next, newCost);
        const priority = newCost;

        frontier.enqueue(next, priority);
        previous.set(next, current);
      }
    }
  }
  const path: SRC[] = [end];
  let next = end;

  while (next !== start && next !== undefined) {
    next = previous.get(next)!;
    path.push(next);
  }

  return path;
}
export function* mapIterator<T, D>(
  iterator: Iterable<T>,
  mapFunction: (t: T) => D
): Iterable<D> {
  for (const item of iterator) {
    const tf = mapFunction(item);

    yield tf;
  }
}
