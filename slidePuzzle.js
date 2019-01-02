const Heap = require("./heapClassSlide");

class SlidePuzzle{
    constructor(input, skipVerification = false){
        //Generate sliding puzzle as an array
        if (Array.isArray(input)){
            if (!skipVerification){
                let validState = this._validatePuzzle(input);
                if (!validState) throw "invalid state";
            }

            this._puzzle = input;

            for (let i in input){
                if (input[i] == 0){
                    this._blankIndex = parseInt(i);
                    break;
                }
            }

            this._size = this._sqrt(input.length);
            this.validMoves();
        } else if (typeof input == "number"){
            let k = input ** 2;
            this._puzzle = Array.from({length: k}, (x, i) => i+1);
            this._blankIndex = k - 1;
            this._puzzle[this._blankIndex] = 0;
            this._size = input;
            this.validMoves();
        } else {
            throw "invalid input";
        }
    }

    _XOR(a, b){
        return ((a && !b) || (!a && b));
    }

    _validatePuzzle(input){
        
        //This block is to validate the size is a perfect square
        let sqrt = this._sqrt(input.length);

        let oddSize = (sqrt % 2) == 1;

        //Now we count inversions. An inversion is where, given two tiles A and B, A appears before B despite A > B
        let inversions = this._inversionCount(input);
        
        let inversionCountIsOdd = (inversions % 2) == 1;

        //If in the N*N board, N is odd
        if (oddSize){
            //All we check is make sure the inversion count is even to be a valid boardstate
            return !inversionCountIsOdd;
        } else {
            //If N is even, first we must find where the blank is
            let blankSpot;
            for (let i in input){
                if (input[i] == 0){
                    blankSpot = i;
                    break;
                }
            }

            //We now check how many rows from the bottom the row is, with the bottom row being 1, second-to-bottom being 2, etc
            let row = sqrt - Math.floor(blankSpot / sqrt);
            //Boolean to see if row number is odd
            let rowIsOdd = (row % 2) == 1;

            //Board state is only valid in the following two cases:
            // -------------------------------
            // | Row Count | Inversion Count |
            // -------------------------------
            // |    Even   |        Odd      |
            // |     Odd   |       Even      |
            // -------------------------------
            // This means XOR will only return true in the proper case we want.
            return this._XOR(rowIsOdd, inversionCountIsOdd);
        }
    }

    _sqrt(input){
        let sqrt = Math.sqrt(input);
        let q = Math.abs(sqrt - Math.floor(sqrt));
        if (q >= 0.0001 ) throw "Invalid size";
        sqrt -= q;
        return sqrt;
    }

    _swapItems(arr, a, b){
        [arr[a], arr[b]] = [arr[b], arr[a]];
    }

    _inversionCount(input = this._puzzle){
        //We initialize an empty array called appeared that will hold values that have already appeared
        let appeared = [];
        let inversions = 0;
        //Main loop
        for (let i = 0; i < input.length; i++){
            //For ease of use, j is the current value we're evaluating
            let j = input[i];
            if (!j) continue;
            //Here we use a reduce to go through the appeared array and count every instance where a value A is found before the current value
            let r = appeared.reduce((a, b) => a += (b > j) ? 1 : 0, 0);
            inversions += r;
            //We now add the current value to the appeared array
            appeared.push(j);
        }
        //Just a boolean to see if the inversion count is odd
        return inversions;
    }

    slideRight(input, blankIndex = this._blankIndex, validMoves = this._validMovesArr){
        let q = false;
        let blankIndexCopy = blankIndex;
        if (!input){
            q = true;
            input = this._puzzle;
        }
        if (validMoves.includes('R')){
            this._swapItems(input, blankIndex, blankIndex - 1);
            if (q){
                this._blankIndex--;
                this.validMoves();
            } else {
                blankIndexCopy--;
                return [blankIndexCopy, input];
            }
        } else {
            throw "invalid move: Right";
        }
    }

    slideLeft(input, blankIndex = this._blankIndex, validMoves = this._validMovesArr){
        let q = false;
        let blankIndexCopy = blankIndex;
        if (!input){
            q = true;
            input = this._puzzle;
        }
        if (validMoves.includes('L')){
            this._swapItems(input, blankIndex, blankIndex + 1);
            if (q){
                this._blankIndex++;
                this.validMoves();
            } else {
                blankIndexCopy++;
                return [blankIndexCopy, input];
            }
        } else {
            throw "invalid move: Left";
        }
    }

    slideUp(input, blankIndex = this._blankIndex, validMoves = this._validMovesArr){
        let q = false;
        let blankIndexCopy = blankIndex;
        if (!input){
            q = true;
            input = this._puzzle;
        }
        if (validMoves.includes('U')){
            this._swapItems(input, blankIndex, blankIndex + this._size);
            if (q){
                this._blankIndex += this._size;
                this.validMoves();
            } else {
                blankIndexCopy += this._size;
                return [blankIndexCopy, input];
            }
        } else {
            throw "invalid move: Up";
        }
    }

    slideDown(input, blankIndex = this._blankIndex, validMoves = this._validMovesArr){
        let q = false;
        let blankIndexCopy = blankIndex;
        if (!input){
            q = true;
            input = this._puzzle;
        }
        if (validMoves.includes('D')){
            this._swapItems(input, blankIndex, blankIndex - this._size);
            if (q){
                this._blankIndex -= this._size;
                this.validMoves();
            } else {
                blankIndexCopy -= this._size;
                return [blankIndexCopy, input];
            }
        } else {
            throw `invalid move: Down`;
        }
    }

    validMoves(input){
        let q = false;
        if (!input && input !== 0){
            q = true;
            input = this._blankIndex;
        }
        let moves = [];
        let blankRowPos = input % this._size;
        let blankRow = Math.floor(input / this._size);

        if (blankRowPos) moves.push('R');
        if (blankRowPos != (this._size - 1)) moves.push('L');
        if (blankRow != this._size - 1) moves.push('U');
        if (blankRow) moves.push('D');

        if (q){
            this._validMovesArr = moves;
        } else {
            return moves;
        }
    }

    shuffle(moveLimit = 60, variance = 0.3){
        if (variance > 0.6) variance = 0.6;
        if (variance < 0) variance = 0;

        let moveVar = Math.floor(moveLimit * variance);
        let rand = Math.floor(Math.random() * moveVar * 2);
        let i = moveLimit - moveVar + rand;

        for(; i; i--){
            let r = Math.floor(Math.random() * this._validMovesArr.length);
            let s = this._validMovesArr[r];

            if (s == 'R') this.slideRight();
            else if (s == 'L') this.slideLeft();
            else if (s == 'U') this.slideUp();
            else if (s == 'D') this.slideDown();
        }
    }

    findH(input = this._puzzle){
        let acc = 0;
        for (let i = 0; i < input.length; i++){
            let curr = input[i];
            if (curr != 0){
                let intendedRow = Math.floor((curr - 1) / this._size);
                let currentRow = Math.floor(i / this._size);
                let intendedCol = (curr - 1) % this._size;
                let currentCol = i % this._size;

                let rowDist = Math.abs(intendedRow - currentRow);
                let colDist = Math.abs(intendedCol - currentCol);

                acc += rowDist + colDist;

                let arr = Array.from({length: this._size}, (x, i) => i);

                if (!rowDist){
                    for (let j in arr){
                        let testCol = arr[j];
                        let k = currentRow * this._size + testCol;
                        let intendTestRow = Math.floor((input[k] - 1)/this._size);
                        if (currentRow != intendTestRow) continue;
                        if (testCol < currentCol){
                            if (input[k] > curr){
                                acc += 2;
                            }
                        } else {
                            if (input[k] < curr && input[k] !== 0){
                                acc +=2;
                            }
                        }
                    }
                }

                if (!colDist){
                    for (let j in arr){
                        let testRow = arr[j];
                        let k = currentCol + testRow * this._size;
                        let intendTestCol = (input[k] - 1) % this._size;
                        if (currentCol != intendTestCol) continue;
                        if (testRow < currentRow){
                            if (input[k] > curr){
                                acc += 2;
                            }
                        } else {
                            if (input[k] < curr && input[k] !== 0){
                                acc += 2;
                            }
                        }
                    }
                }
            }
        }
        
        let inversions = this._inversionCount(input);

        let vert = Math.floor(inversions / (this._size - 1)) + inversions % (this._size - 1);
        let idealHor = [];
        for (let i = 0; i < input.length; i++){
            let n = this._size * (i % this._size) + Math.floor(i / this._size);
            idealHor[n] = i + 1;
        }
        idealHor[input.length - 1] = 0;

        let horInput = [];

        for (let i = 0; i < input.length; i++){
            let n = this._size * (i % this._size) + Math.floor(i / this._size);
            horInput.push(idealHor[n]);
        }

        let horInversions = this._inversionCount(horInput);
        let hor = Math.floor(horInversions / (this._size - 1)) + horInversions % (this._size - 1);

        let invertDistance = vert + hor;


        return acc > invertDistance ? acc : invertDistance;
    }

    isSolved(input = this._puzzle){
        return input.reduce((a, b, i) => a && (b == i+1 || b == 0), true);
    }

    get puzzle(){
        return [...this._puzzle];
    }

    get f(){
        return this._f;
    }

    solve(){
        this._h = this.findH();
        this._g = 0;
        this._f = this._g + this._h;

        let heap = new Heap([], 'max', 'g', 'f');

        let maxDepth = 2;
        let i;
        if (this._size % 2){
            i = this._blankIndex % 2;
        } else {
            i = ((this._blankIndex) % 2 + Math.floor(this._blankIndex / this._size)) % 2;
        }
        for (; i < maxDepth; i+=2){
            console.log(`depth: ${i}`)
            let res = this._exploreStates(i, heap);
            if (res == false) {
                maxDepth+=2;
                continue;
            } else return res;
        }
    }

    _exploreStates(maxDepth, heap){
        let initState = {
            state: this.puzzle,
            g: 0,
            h: this.findH(),
            moves: [],
            validMoves: this._validMovesArr,
            blankIndex: this._blankIndex,
        };
        initState.f = initState.g + initState.h;

        heap.insert(initState);

        while(heap.size){
            let currentState = heap.pop();
            
            if (currentState.h + currentState.g > maxDepth) continue;
            currentState.validMoves = this.validMoves(currentState.blankIndex);

            let r = this.isSolved(currentState.state);
            if (r) return currentState;

            if (currentState.g == maxDepth) continue;


            if (currentState.validMoves.includes('R')){
                let [potentialBlank, potentialMove] = this.slideRight([...currentState.state], currentState.blankIndex, [...currentState.validMoves]);

                let potentialState = {
                    state: potentialMove,
                    g: currentState.g + 1,
                    h: this.findH(potentialMove),
                    moves: [...[...currentState.moves],'R'],
                    blankIndex: potentialBlank
                };
                potentialState.f = potentialState.g + potentialState.h;

                heap.insert(potentialState);
            }

            if (currentState.validMoves.includes('L')){
                let [potentialBlank, potentialMove] = this.slideLeft([...currentState.state], currentState.blankIndex, [...currentState.validMoves]);

                let potentialState = {
                    state: potentialMove,
                    g: currentState.g + 1,
                    h: this.findH(potentialMove),
                    moves: [...[...currentState.moves],'L'],
                    blankIndex: potentialBlank
                };
                potentialState.f = potentialState.g + potentialState.h

                heap.insert(potentialState);
            }

            if (currentState.validMoves.includes('U')){
                let [potentialBlank, potentialMove] = this.slideUp([...currentState.state], currentState.blankIndex, [...currentState.validMoves]);

                let potentialState = {
                    state: potentialMove,
                    g: currentState.g + 1,
                    h: this.findH(potentialMove),
                    moves: [...[...currentState.moves],'U'],
                    blankIndex: potentialBlank
                };
                potentialState.f = potentialState.g + potentialState.h;

                heap.insert(potentialState);
            }

            if (currentState.validMoves.includes('D')){
                let [potentialBlank, potentialMove] = this.slideDown([...currentState.state], currentState.blankIndex, [...currentState.validMoves]);

                let potentialState = {
                    state: potentialMove,
                    g: currentState.g + 1,
                    h: this.findH(potentialMove),
                    moves: [...[...currentState.moves],'D'],
                    blankIndex: potentialBlank,
                };
                potentialState.f = potentialState.g + potentialState.h;

                heap.insert(potentialState);
            }
        }
        return false;
    }
}



let validBoard = [6, 13, 7, 10, 8, 9, 11, 0, 15, 2, 12, 5, 14, 3, 1, 4];
let invalidBoard = [3, 9, 1, 15, 14, 11, 4, 6, 13, 0, 10, 12, 2, 7, 8, 5];
let FourteenMove = [ 1, 2, 3, 4, 5, 11, 10, 7, 9, 6, 12, 15, 13, 14, 8, 0 ];
let Eight26Move = [ 2, 4, 0, 3, 6, 7, 5, 8, 1 ];
let LinearCollision = [1, 2, 3, 0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 4];
let q = new SlidePuzzle(FourteenMove);
// console.log(q);
// q.shuffle(100);
console.log(q);
console.log(q.findH());
let hrStart = process.hrtime();
console.log(q.solve());
let hrEnd = process.hrtime(hrStart);
hrEnd[1] /= 1000000;
console.log(`seconds: ${hrEnd[0]} ms: ${hrEnd[1]}`);