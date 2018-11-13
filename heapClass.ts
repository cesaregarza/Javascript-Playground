export class Heap {
  private _arr: Array<number>;
  private _order: "min" | "max";
  private _prop: string | null;

  constructor(arr: Array<number>, order: "min" | "max", prop: string | null = null) {
    this._arr = arr;
    this._order = order;
    this._prop = prop ? prop : null;
  }

  pop(): number{
    let l = this._arr.length - 1;

    [this._arr[0], this._arr[l]] = [this._arr[l], this._arr[0]];
    let p = this._arr.pop();
    if (p === undefined){
      throw `Error popping heap`;
    }
    this._heapify(0);
    return p;
  }

  private _heapify(startIndex: number) {
    if (startIndex > this._arr.length) return;

    let child1 = startIndex * 2 + 1;
    let child2 = startIndex * 2 + 2;
    let child1Exists = (this._arr[child1] != undefined);
    let child2Exists = (this._arr[child2] != undefined);

    let finalIndex = -1;

    if (child1Exists && !this._compare(this._arr[startIndex], this._arr[child1])) {
      
      if (child2Exists && this._compare(this._arr[child1], this._arr[child2])) {
        
        [this._arr[startIndex], this._arr[child1]] = [this._arr[child1], this._arr[startIndex]];
        finalIndex = child1;

      } else if (child2Exists) {

        [this._arr[startIndex], this._arr[child2]] = [this._arr[child2], this._arr[startIndex]];
        finalIndex = child2;
      } else {
        [this._arr[startIndex], this._arr[child1]] = [this._arr[child1], this._arr[startIndex]];
        finalIndex = child1;
      }

    } else if (child2Exists && !this._compare(this._arr[startIndex], this._arr[child2])) {
      
      [this._arr[startIndex], this._arr[child2]] = [this._arr[child2], this._arr[startIndex]];
      finalIndex = child2;

    } else return;

    if (finalIndex != -1) {
      this._heapify(finalIndex);
    }
  }

  private _compare(a: any, b: any, equals ? : any, property: string | null = this._prop) {
    if (!property) {
      if (!equals) {
        if (this._order == "max") {
          return (a > b);
        } else {
          return (a < b);
        }
      } else {
        if (this._order == "max") {
          return (a >= b);
        } else {
          return (a <= b);
        }
      }
    } else {
      if (!equals) {
        if (this._order == "max") {
          return (a[property] > b[property]);
        } else {
          return (a[property] < b[property]);
        }
      } else {
        if (this._order == "max") {
          return (a[property] >= b[property]);
        } else {
          return (a[property] <= b[property]);
        }
      }
    }
  }

  insert(a: number) {
    this._arr.push(a);
    this._bubbleUp(this._arr.length - 1);
  }

  private _bubbleUp(startIndex: number) {
    if (startIndex === 0) return;
    let si = startIndex + 1;
    let parentIndex = (si - si % 2) / 2 - 1;
    if (this._compare(this._arr[startIndex], this._arr[parentIndex])) {
      [this._arr[startIndex], this._arr[parentIndex]] = [this._arr[parentIndex], this._arr[startIndex]];
    } else return;

    this._bubbleUp(parentIndex);
  }

  isValidHeap(startIndex: number) {
    if (startIndex >= this._arr.length) return [true];
    let child1 = startIndex * 2 + 1;
    let child2 = child1 + 1;
    let arr: any = [this._arr[child1] === undefined || this._compare(this._arr[startIndex], this._arr[child1], 1), this.isValidHeap(child1)];
    arr.push(this.isValidHeap(child2));
    return arr.reduce((a:Boolean, b:Boolean) => a && b, true);
  }

  get size(){
    return this._arr.length;
  }
}