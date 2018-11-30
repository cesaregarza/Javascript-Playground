class Heap {
    constructor(arr, order, prop = null) {
        this._arr = arr;
        this._order = order;
        this._prop = prop ? prop : null;
    }
    pop() {
        let l = this._arr.length - 1;
        [this._arr[0], this._arr[l]] = [this._arr[l], this._arr[0]];
        let p = this._arr.pop();
        if (p === undefined) {
            throw `Error popping heap`;
        }
        this._heapify(0);
        return p;
    }
    _heapify(startIndex = 0) {
        if (startIndex > this._arr.length)
            return;
        let child1 = startIndex * 2 + 1;
        let child2 = startIndex * 2 + 2;
        let child1Exists = (this._arr[child1] != undefined);
        let child2Exists = (this._arr[child2] != undefined);
        let finalIndex = -1;
        if (child1Exists && !this._compare(this._arr[startIndex], this._arr[child1])) {
            if (child2Exists && this._compare(this._arr[child1], this._arr[child2])) {
                [this._arr[startIndex], this._arr[child1]] = [this._arr[child1], this._arr[startIndex]];
                finalIndex = child1;
            }
            else if (child2Exists) {
                [this._arr[startIndex], this._arr[child2]] = [this._arr[child2], this._arr[startIndex]];
                finalIndex = child2;
            }
            else {
                [this._arr[startIndex], this._arr[child1]] = [this._arr[child1], this._arr[startIndex]];
                finalIndex = child1;
            }
        }
        else if (child2Exists && !this._compare(this._arr[startIndex], this._arr[child2])) {
            [this._arr[startIndex], this._arr[child2]] = [this._arr[child2], this._arr[startIndex]];
            finalIndex = child2;
        }
        else
            return;
        if (finalIndex != -1) {
            this._heapify(finalIndex);
        }
    }
    _compare(a, b, equals, property = this._prop) {
        if (!property) {
            if (!equals) {
                if (this._order == "max") {
                    return (a > b);
                }
                else {
                    return (a < b);
                }
            }
            else {
                if (this._order == "max") {
                    return (a >= b);
                }
                else {
                    return (a <= b);
                }
            }
        }
        else {
            if (!equals) {
                if (this._order == "max") {
                    return (a[property] > b[property]);
                }
                else {
                    return (a[property] < b[property]);
                }
            }
            else {
                if (this._order == "max") {
                    return (a[property] >= b[property]);
                }
                else {
                    return (a[property] <= b[property]);
                }
            }
        }
    }
    insert(a) {
        this._arr.push(a);
        this._bubbleUp(this._arr.length - 1);
    }
    _bubbleUp(startIndex) {
        if (startIndex === 0)
            return;
        let si = startIndex + 1;
        let parentIndex = (si - si % 2) / 2 - 1;
        if (this._compare(this._arr[startIndex], this._arr[parentIndex])) {
            [this._arr[startIndex], this._arr[parentIndex]] = [this._arr[parentIndex], this._arr[startIndex]];
        }
        else
            return;
        this._bubbleUp(parentIndex);
    }
    isValidHeap(startIndex = 0) {
        if (startIndex >= this._arr.length)
            return [true];
        let child1 = startIndex * 2 + 1;
        let child2 = child1 + 1;
        let arr = [this._arr[child1] === undefined || this._compare(this._arr[startIndex], this._arr[child1], 1), this.isValidHeap(child1)];
        arr.push(this.isValidHeap(child2));
        let acc = true;
        for (let i in arr){
            acc = acc && arr[i];
        }

        if (acc){
            acc = true;
        }
        return acc;
    }
    get size() {
        return this._arr.length;
    }
    sort() {
        let originalArr = this._arr;
        this._initHeapify();
        let sortedArr = [];
        while (this._arr.length) {
            sortedArr.push(this.pop());
        }
        this._arr = originalArr;
        return sortedArr;
    }
    _initHeapify() {
        let tempArr = this._arr;
        this._arr = [];
        while (tempArr.length) {
            let p = tempArr.pop();
            if (p === undefined) {
                throw `undefined`;
            }
            this.insert(p);
        }
        return;
    }
}

module.exports = Heap;

// let h = new Heap([], 'min');
// let p = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// let g = new Heap([...p], 'max');

// for (let i in p){
//     h.insert(p[i]);
// }

// console.log(h);
// console.log(h.isValidHeap());
// console.log(g.isValidHeap());