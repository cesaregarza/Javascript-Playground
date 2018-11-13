"use strict";
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
    _heapify(startIndex) {
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
    isValidHeap(startIndex) {
        if (startIndex >= this._arr.length)
            return [true];
        let child1 = startIndex * 2 + 1;
        let child2 = child1 + 1;
        let arr = [this._arr[child1] === undefined || this._compare(this._arr[startIndex], this._arr[child1], 1), this.isValidHeap(child1)];
        arr.push(this.isValidHeap(child2));
        return arr.reduce((a, b) => a && b, true);
    }
    get size() {
        return this._arr.length;
    }
}
class xNode {
    constructor(val, x, y) {
        this._pos = `${x},${y}`;
        this._g = undefined;
        this._h = undefined;
        this._f = undefined;
        this._cost = val;
        this._visited = false;
        this._closed = false;
        this._parent = null;
    }
    get pos() {
        return this._pos;
    }
    get g() {
        return this._g;
    }
    get h() {
        return this._h;
    }
    get f() {
        return this._f;
    }
    get cost() {
        return this._cost;
    }
    get visited() {
        return this._visited;
    }
    get closed() {
        return this._closed;
    }
    get parent() {
        return this._parent;
    }
    set g(newG) {
        this._g = newG;
    }
    set h(newH) {
        this._h = newH;
    }
    set f(newF) {
        this._f = newF;
    }
    set visited(val) {
        this._visited = val;
    }
    set closed(val) {
        this._closed = val;
    }
    set parent(val) {
        this._parent = val;
    }
}
function aStar() {
    function init(grid) {
        let newGrid = grid.map((x, i) => x.map((y, j) => new xNode(y, j, i)));
        return newGrid;
    }
    function findNeighbors(grid, node) {
        let s = node.pos;
        let [x, y] = s.split(",").map(z => parseInt(z));
        let returner = [];
        if (grid[y - 1] && grid[y - 1][x]) {
            returner.push(grid[y - 1][x]);
        }
        if (grid[y + 1] && grid[y + 1][x]) {
            returner.push(grid[y + 1][x]);
        }
        if (grid[y][x - 1]) {
            returner.push(grid[y][x - 1]);
        }
        if (grid[y][x + 1]) {
            returner.push(grid[y][x + 1]);
        }
        return returner;
    }
    function taxicabDistance(pos1, pos2) {
        let [x1, y1] = pos1.split(",").map(z => parseInt(z));
        let [x2, y2] = pos2.split(",").map(z => parseInt(z));
        let dx = Math.abs(x1 - x2);
        let dy = Math.abs(y1 - y2);
        return dx + dy;
    }
    function traverseNode(node, prop = "cost") {
        let arr = [];
        if (node.parent !== null) {
            arr = [...traverseNode(node.parent), node[prop]];
        }
        else {
            arr = [node[prop]];
        }
        return arr;
    }
    function search(grid, startPos, endPos, openHeap) {
        let startNode = grid[startPos[1]][startPos[0]];
        let endNode = grid[endPos[1]][endPos[0]];
        startNode.g = startNode.cost;
        startNode.h = taxicabDistance(startNode.pos, endNode.pos);
        startNode.f = startNode.g + startNode.h;
        openHeap.insert(startNode);
        while (openHeap.size) {
            let currentNode = openHeap.pop();
            if (currentNode.pos == endNode.pos) {
                let n = traverseNode(currentNode, "pos");
                return [n, currentNode.f];
            }
            let neighbors = findNeighbors(grid, currentNode);
            currentNode.closed = true;
            for (let i in neighbors) {
                let neighbor = neighbors[i];
                if (neighbor.closed || neighbor.cost == -1 || currentNode.g == undefined) {
                    continue;
                }
                let gScore = currentNode.g + neighbor.cost;
                let minG = false;
                let notVis = false;
                if (!neighbor.visited) {
                    minG = true;
                    neighbor.visited = true;
                    notVis = true;
                    neighbor.h = taxicabDistance(neighbor.pos, endNode.pos);
                }
                else if (neighbor.g && gScore < neighbor.g) {
                    minG = true;
                }
                if (minG && neighbor.h) {
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.h + neighbor.g;
                    if (notVis) {
                        openHeap.insert(neighbor);
                    }
                }
            }
        }
        return [];
    }
    function run(grid, startPos = [0, 0], endPos = [grid.length - 1, grid[0].length - 1]) {
        let redraw = init(grid);
        let openHeap = new Heap([], "min", "f");
        let [path, cost] = search(redraw, startPos, endPos, openHeap);
        return [path, cost];
    }
}
