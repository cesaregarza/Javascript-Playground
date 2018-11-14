//Create our Heap Class. This could not be imported as we're going to be using the xNode class within this implementation of Heap.
class Heap {
    constructor(arr, order, prop = null) {
        this._arr = arr;
        this._order = order;
        this._prop = prop ? prop : null;
    }
    //Pop does the opposite of Array.prototype.pop; this will return you the root node, then heapify to make sure it's still a valid heap.
    pop() {
        let l = this._arr.length - 1;
        //swaps root node with last leaf node
        [this._arr[0], this._arr[l]] = [this._arr[l], this._arr[0]];
        //pop out the original root node
        let p = this._arr.pop();
        //In the *extremely* rare case that the last leaf was undefined, throw an error
        if (p === undefined) {
            throw `Error popping heap`;
        }
        //run Heapify
        this._heapify(0);
        return p;
    }
    //Heapify. When run, it will compare if the root node is in fact deserving to be there. 
    //If it's not, it will swap positions with the larger/smaller child (depending on whether it's a minheap or a maxheap) and continue to execute until it's larger/smaller than its children.
    _heapify(startIndex) {
        //Return condition
        if (startIndex > this._arr.length)
            return;
        //Calculate the indexes on _arr of the two children.
        let child1 = startIndex * 2 + 1;
        let child2 = startIndex * 2 + 2;
        //Create variables in case child1 or child2 don't exist. This is to prevent instantiating invalid array elements
        let child1Exists = (this._arr[child1] != undefined);
        let child2Exists = (this._arr[child2] != undefined);
        //Hoist finalIndex and give it a temporary value to check for at the end
        let finalIndex = -1;
        //If Child1 Exists AND it's larger/smaller than its parent
        if (child1Exists && !this._compare(this._arr[startIndex], this._arr[child1])) {
            //Compare Child1 and Child2 (if it exists)
            if (child2Exists && this._compare(this._arr[child1], this._arr[child2])) {
                //Swap Child1 and the root
                [this._arr[startIndex], this._arr[child1]] = [this._arr[child1], this._arr[startIndex]];
                finalIndex = child1;
                //if Child2 exists AND is greater
            }
            else if (child2Exists) {
                //Swap Child2 and the root
                [this._arr[startIndex], this._arr[child2]] = [this._arr[child2], this._arr[startIndex]];
                finalIndex = child2;
                //Child2 doesn't exist
            }
            else {
                //Swap Child1 with the root
                [this._arr[startIndex], this._arr[child1]] = [this._arr[child1], this._arr[startIndex]];
                finalIndex = child1;
            }
            //If root is larger/smaller than Child1, compare root with Child2 (if it exists)
        }
        else if (child2Exists && !this._compare(this._arr[startIndex], this._arr[child2])) {
            //Swap Child2 with root
            [this._arr[startIndex], this._arr[child2]] = [this._arr[child2], this._arr[startIndex]];
            finalIndex = child2;
            //If root is larger than both children, return
        }
        else
            return;
        //Heapify on the new position of the swapped root
        if (finalIndex != -1) {
            this._heapify(finalIndex);
        }
    }
    //Compares two values depending on whether it's a minheap or a maxheap. Will return TRUE if a is preferable to b (smaller if minheap, larger if maxheap). 
    //Third argument can be literally anything, it'll only check for falsiness
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
    //Insert a node into the heap while retaining heap properties. It inserts it at the end of the array, then bubbles up until it satisfies the properties of the heap.
    insert(a) {
        this._arr.push(a);
        this._bubbleUp(this._arr.length - 1);
    }
    //bubbles up a leaf from the bottom until it reaches a place where it satisfies the requirements of the heap.
    _bubbleUp(startIndex) {
        //If we're at the root, we can stop.
        if (startIndex === 0)
            return;
        let si = startIndex + 1;
        //Calculate the index of the parent. This is the reverse of the ChildIndex operation found in _heapify.
        let parentIndex = (si - si % 2) / 2 - 1;
        //Check if the current node is preferable to the root of the current heap. If it is, swap with it.
        //Note that compare has equals enabled so newer nodes that are bubbling up are considered before older nodes.
        if (this._compare(this._arr[startIndex], this._arr[parentIndex], 1)) {
            [this._arr[startIndex], this._arr[parentIndex]] = [this._arr[parentIndex], this._arr[startIndex]];
        }
        else
            return;
        //Bubble up again, with the parentIndex.
        this._bubbleUp(parentIndex);
    }
    //Just checks if the heap is valid or not. Returns a boolean.
    isValidHeap(startIndex = 0) {
        //If the index parameter is larger than the length of the array, cut it short.
        if (startIndex >= this._arr.length)
            return [true];
        //Calculate Indexes of the Children
        let child1 = startIndex * 2 + 1;
        let child2 = child1 + 1;
        //Go through entire left tree first
        let arr = [this._arr[child1] === undefined || this._compare(this._arr[startIndex], this._arr[child1], 1), this.isValidHeap(child1)];
        //Go through entire right tree
        arr.push(this.isValidHeap(child2));
        //Crunch down entire array with reduce, if a single value is false it will return the entire thing as false.
        return arr.reduce((a, b) => a && b, true);
    }
    //getter to return Heap size
    get size() {
        return this._arr.length;
    }
}
//Nodes! Named xNode because Node is protected in TypeScript. These store lots more information than the input number grids.
class xNode {
    //When using new xNode, sets up a new xNode!
    constructor(val, x, y) {
        this._pos = `${x},${y}`; //Position string 'x,y';
        this._g = undefined; //distance from start score
        this._h = undefined; //heuristic score
        this._f = undefined; //g + h, final score
        this._cost = val; //cost of the node's traversal
        this._visited = false; //checks if Node has been visited
        this._closed = false; //checks if Node is considered "closed"
        this._parent = null; //parent of the node, or last node taken before this one.
    }
    //getters ensue
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
    //setters ensue
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
export var aStar = {
    //Transforms the grid of numbers into a grid of nodes!
    init(grid) {
        let newGrid = grid.map((x, i) => x.map((y, j) => new xNode(y, j, i)));
        return newGrid;
    },
    //Function that returns an array of xNodes that are the given node's "neighbors". That is, in 2D, the xNodes located directly above, below, to the left, and to the right.
    findNeighbors(grid, node) {
        //We can't run split on node.pos directly, so we assign it to a variable
        let s = node.pos;
        let [x, y] = s.split(",").map(z => parseInt(z));
        let returner = [];
        //Check if the neighbor node exists, if so then add it to the returner.
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
    },
    //Returns the taxicab Distance, or the "Manhattan" distance. Pretend diagonals aren't possible, it's how far away from the end we are.
    taxicabDistance(pos1, pos2) {
        let [x1, y1] = pos1.split(",").map(z => parseInt(z));
        let [x2, y2] = pos2.split(",").map(z => parseInt(z));
        let dx = Math.abs(x1 - x2);
        let dy = Math.abs(y1 - y2);
        return dx + dy;
    },
    //Traverses the parent nodes until it reaches the start and enumerates the desired property from each xNode. Defaults to 'pos'
    traverseNode(node, prop = "pos") {
        let arr = [];
        if (node.parent !== null) {
            arr = [...this.traverseNode(node.parent), node[prop]];
        }
        else {
            arr = [node[prop]];
        }
        return arr;
    },
    //The big bad search function. Takes in the grid of xNodes, a start position array [x,y] an end position array [x, y], and the heap to use.
    search(grid, startPos, endPos, openHeap) {
        //Grabs the start and end nodes. REMEMBER THE GRID IS IS grid[y][x]! VITAL!
        let startNode = grid[startPos[1]][startPos[0]];
        let endNode = grid[endPos[1]][endPos[0]];
        //prep the starting xNode for use
        startNode.g = startNode.cost;
        startNode.h = this.taxicabDistance(startNode.pos, endNode.pos);
        startNode.f = startNode.g + startNode.h;
        //Now that the starting xNode has been prepped, let's push it into our heap.
        openHeap.insert(startNode);
        //This will keep running while there exist valid nodes to check in our heap
        while (openHeap.size) {
            //pop out the currentNode, because of the properties of a heap this will be the most efficient so far.
            let currentNode = openHeap.pop();
            //If our currentNode is the same as our lastNode, end it.
            if (currentNode.pos == endNode.pos) {
                //enumerate an array containing the positions of all the squares in our path
                let n = this.traverseNode(currentNode, "pos");
                if (currentNode.f == undefined) {
                    return [];
                }
                return [n, currentNode.f];
            }
            //Find all the currentNode's neighbors
            let neighbors = this.findNeighbors(grid, currentNode);
            //Close the currentNode.
            currentNode.closed = true;
            //Let's iterate through all the listed neighbors
            for (let i in neighbors) {
                let neighbor = neighbors[i];
                //If the neighbor we're examining is closed, or has a cost of -1 indicating a wall, go to the next neighbor in the loop
                if (neighbor.closed || neighbor.cost == -1 || currentNode.g == undefined) {
                    continue;
                }
                //This is the preliminary gScore.
                let gScore = currentNode.g + neighbor.cost;
                let minG = false;
                let notVis = false;
                if (!neighbor.visited) {
                    //This is the first time this neighbor has been visited, so it must be the best.
                    minG = true;
                    neighbor.visited = true;
                    notVis = true;
                    neighbor.h = this.taxicabDistance(neighbor.pos, endNode.pos);
                }
                else if (neighbor.g && gScore < neighbor.g) {
                    //This neighbor has been visited before, but its gScore is better than before.
                    minG = true;
                }
                if (minG && neighbor.h !== undefined) {
                    //If this is the smallest gScore for this neighbor, ready it up and push it into our heap
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.h + neighbor.g;
                    if (notVis) {
                        //If this neighbor hasn't been visited before, push it into the heap!
                        openHeap.insert(neighbor);
                    }
                }
            }
        }
        return [];
    },
    //Runs the entire aStar function! Tadaa!
    run(grid, startPos = [0, 0], endPos = [grid.length - 1, grid[0].length - 1]) {
        let redraw = this.init(grid);
        let openHeap = new Heap([], "min", "f");
        let [path, cost] = this.search(redraw, startPos, endPos, openHeap);
        return [path, cost];
    }
};
