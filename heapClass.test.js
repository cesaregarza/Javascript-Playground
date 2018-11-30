const Heap = require('./heapClass');

const isMinSorted = (arr) => {
    for (let i in arr){
        if (!i) continue;
        if (arr[i] < arr[i-1]) return false;
    }

    return true;
};

const isMaxSorted = (arr) => {
    for (let i in arr){
        if (!i) continue;
        if (arr[i] > arr[i-1]) return false;
    }
    return true;
};

let validMaxHeap = [150,40,80,39,3,79,77,36,2,1,0,40];
let validMinHeap = [0,1,5,3,5,7,8,4,5,6,6];

test('Successfully pop top value in heap', () => {
    let p = new Heap([...validMaxHeap], 'max');
    let s = p.pop();
    expect(s).toBe(150);
});

test(`Successfully sort max heap`, () => {
    let p = new Heap([...validMaxHeap], 'max');
    let s = p.sort();
    expect(isMaxSorted(s)).toBe(true);
});

test(`Successfully sort min heap`, () => {
    let p = new Heap([...validMinHeap], 'min');
    let s = p.sort();
    expect(isMinSorted(s)).toBe(true);
});

test(`isValidHeap on working heap`, () => {
    let p = new Heap([...validMaxHeap], 'max');
    expect(p.isValidHeap()).toBe(true);
});

test(`isValidHeap on invalid heap`, () => {
    let p = new Heap([...validMinHeap], 'max');
    expect(p.isValidHeap()).toBe(false);
});

test(`Successfully insert value to existing max heap`, () => {
    let p = new Heap([...validMaxHeap], 'max');
    p.insert(300);
    expect(p.isValidHeap()).toBe(true);
});

test(`Successfully insert value to existing min heap`, () => {
    let p = new Heap([...validMinHeap], 'min');
    p.insert(-1);
    expect(p.isValidHeap()).toBe(true);
});

test(`Successfully retrieve heap size`, () => {
    let r = Math.floor(Math.random() * 20);
    let a = Array.from({length: r}, () => 0);
    let p = new Heap(a, 'min');
    expect(p.size).toBe(r);
});