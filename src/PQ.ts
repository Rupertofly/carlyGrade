class QElement<T> {
  constructor(public element: T, public priority: number) {}
}
export class PriorityQueue<T> extends Array<QElement<T>> {
  constructor() {
    super(0);
  }
  public enqueue(element: T, priority: number): void {
    const QE = new QElement(element, priority);
    let contain = false;

    for (let i = 0; i < this.length; i++) {
      if (this[i].priority > QE.priority) {
        this.splice(i, 0, QE);
        contain = true;
        break;
      }
    }
    if (!contain) this.push(QE);
  }
  public dequeue(): QElement<T> {
    if (this.length == 0) {
      throw new Error('Queue underflow');
    }

    return this.shift()!;
  }
  get front(): QElement<T> {
    if (this.length == 0) {
      throw new Error('Queue underflow');
    }

    return this[0]!;
  }
  get rear(): QElement<T> {
    if (this.length == 0) {
      throw new Error('Queue underflow');
    }

    return this[this.length - 1]!;
  }
}
