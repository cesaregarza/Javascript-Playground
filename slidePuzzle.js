const Heap = require("./heapClassSlide");

class SlidePuzzle{
    /**
     * Constructor. Creates the puzzle instance
     * @param {number[] | number} input Takes an array and generates the puzzle, or takes a number and generates a puzzle of size N x N
     * @param {boolean} skipVerification Default to false, specifies to skip verification if the user wants to for whatever reason
     */
    constructor(input, skipVerification = false){
        
        //Generate sliding puzzle as an array
        if (Array.isArray(input)){
            //This will validate the puzzle if skipVerification is not specified, which only happens if the user specifies it.
            if (!skipVerification){
                let validState = this._validatePuzzle(input);
                if (!validState) throw "invalid state";
            }

            //Establish the array that will hold the puzzle itself
            this._puzzle = input;

            //Find the index of the space
            for (let i in input){
                if (input[i] == 0){
                    this._blankIndex = parseInt(i);
                    break;
                }
            }

            //We specify the size of the array for later use. This is extraordinarily useful later on.
            this._size = this._sqrt(input.length);
            //We now calculate the valid moves that are possible from the puzzle's current state.
            this.validMoves();
        } else if (typeof input == "number"){
            //If the user doesn't specify an array, we will generate a new puzzle in order whose size is N x N
            let k = input ** 2;
            //We create the array from 1 to 16.
            this._puzzle = Array.from({length: k}, (x, i) => i+1);
            //We set the index of the blank to be at the end
            this._blankIndex = k - 1;
            //We overwrite the 16 with a 0, indicating the blank
            this._puzzle[this._blankIndex] = 0;
            //We now store the size of the puzzle
            this._size = input;
            //We calculate the valid moves available from here
            this.validMoves();
        } else {
            //If the input is not valid, throw an error at the user.
            throw "invalid input";
        }
        this._idealHor = [];
        for (let i = 0; i < this._puzzle.length; i++){
            let n = this._size * (i % this._size) + Math.floor(i / this._size);
            this._idealHor[n] = i + 1;
        }
    }

    /**
     * Logical XOR. Generally useful, cleans up code when referenced.
     * @param {boolean} a First boolean
     * @param {boolean} b Second boolean
     * @returns {boolean} returns the XOR of A and B.
     */
    _XOR(a, b){
        return ((a && !b) || (!a && b));
    }

    /**
     * ValidatePuzzle. Validates the input array as a valid sliding puzzle that's solvable. Easy enough.
     * @param {Array} input The array we're trying to validate
     */
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

    /**
     * Sqrt, given an input, finds the square root. Also tries to correct for floating point errors in the process to return an integer
     * @param {number} input number trying to find the square root of
     */
    _sqrt(input){
        //Find the square root
        let sqrt = Math.sqrt(input);
        //Find any decimal remainder
        let q = Math.abs(sqrt - Math.floor(sqrt));
        if (q >= 0.0001 ) throw "Invalid size";
        //Lop off the remainder
        sqrt -= q;
        //Return the integer value
        return sqrt;
    }

    /**
     * Swaps two items in any given array. Made as a separate function for readability of code
     * @param {Array} arr array whose items you wish to swap
     * @param {number} a index of first item in the swap
     * @param {number} b index of second item in the swap
     */
    _swapItems(arr, a, b){
        [arr[a], arr[b]] = [arr[b], arr[a]];
    }

    /**
     * Inversion Count. Given an array, counts the number of times a number A appears before a number B, given that A > B.
     * @param {Array} input Array of puzzle you want to count inversions for.
     * @returns {number} returns the number of inversions
     */
    _inversionCount(input = this._puzzle, horizontal = false){
        //We initialize an empty array called appeared that will hold values that have already appeared
        let appeared = [];
        let inversions = 0;
        //Main loop
        if (!horizontal){
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
        } else {
            for (let i = 0; i < input.length; i++){
                let n = this._size * (i % this._size) + Math.floor(i / this._size);
                let j = this._idealHor[input[n] - 1];
                if (!j) continue;
                
                let r = appeared.reduce((a, b) => a += (b > j) ? 1 : 0, 0);
                inversions += r;
                appeared.push(j);
            }
        }

        return inversions;
    }

    /**
     * Slide Right. Slides the number on the right of the blank space into the blank space. NOTE: DOES NOT SLIDE THE BLANK TO THE RIGHT!!
     * @param {Array} input Input array of puzzle state
     * @param {number} blankIndex Index of the blank in the above puzzle state
     * @param {Array} validMoves Array enumerating valid moves the puzzle state can do
     */
    slideRight(input, blankIndex = this._blankIndex, validMoves = this._validMovesArr){
        //Dummy variable
        let q = false;
        //Creates a copy of the blank Index fed into it. Useful to prevent mutating the puzzle state when considering potential states
        let blankIndexCopy = blankIndex;
        //If no input was given, set the dummy variable to true and set the input as the puzzle's current state
        if (!input){
            q = true;
            input = this._puzzle;
        }
        //If the validMoves include 'Right', then go ahead
        if (validMoves.includes('R')){
            //Swap the item to the right of the blank and the blank
            //CAUTION: MUTATES INPUT ARRAY, FEED A SHALLOW COPY IF THIS IS NOT DESIRED BEHAVIOR
            this._swapItems(input, blankIndex, blankIndex - 1);
            //If the dummy variable is true, this means an input was given.
            if (q){
                //reassign blankIndex to its new position
                this._blankIndex--;
                //recalculate the list of valid moves the puzzle's new state an take.
                this.validMoves();
            } else {
                //If an input was fed, alter the copy of the blankIndex
                blankIndexCopy--;
                //Return both the blankIndex and the mutated, new array state
                return [blankIndexCopy, input];
            }
        } else {
            throw "invalid move: Right";
        }
    }

    //See slideRight
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

    //see SlideRight
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

    //see slideRight
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

    /**
     * ValidMoves, calculates and enumerates the list of valid moves available from the given blank Index
     * @param {number} input Input blank index
     */
    validMoves(input){
        //Dummy variable
        let q = false;
        //If the input is falsey, and that input is NOT zero
        if (!input && input !== 0){
            //set dummy variable to true and set input as the blank index of the puzzle state
            q = true;
            input = this._blankIndex;
        }
        //Create an empty array that will hold the available moves
        let moves = [];
        //Find the column the blank is located in
        let blankRowPos = input % this._size;
        //Find the row the blank is located in
        let blankRow = Math.floor(input / this._size);

        //If the blank is not located in the first column, right is a possible move
        if (blankRowPos) moves.push('R');
        //If the blank is not located in the last column, left is a possible move
        if (blankRowPos != (this._size - 1)) moves.push('L');
        //If the blank is not located in the last row, up is a possible move
        if (blankRow != this._size - 1) moves.push('U');
        //If the blank is not located in the first row, down is a possible move
        if (blankRow) moves.push('D');

        //If the dummy variable is true, we overwrite the valid moves Array of our puzzle state to the output of the function
        if (q){
            this._validMovesArr = moves;
        } else {
            //otherwise return the list of moves
            return moves;
        }
    }

    /**
     * Shuffle. Shuffles the puzzle state using random valid moves
     * @param {number} moveLimit Number of moves you want to take in the shuffle
     * @param {number} variance Variance on the number of moves in the shuffle. Defaults to 30%
     */
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

    /**
     * findH, the Heuristic Function. The engine that powers IDA*, this creates an estimate of how many moves to completion.
     * @param {Array} input The boardstate we're considering
     * @returns {number} Returns the estimate of moves required to finish the current board.
     */
    findH(input = this._puzzle, blankIndex = false, lastIndex = false, acc = 0, vert = 0, hor = 0){
        let isVert = (Math.abs(blankIndex - lastIndex) != 1);
        //accumulator. This variable will collect distance esimation through the use of taxicab distance, Manhattan distance, or most accurately: the L1 norm.
        // acc = 0;
        if (!acc){
            for (let i = 0; i < input.length; i++){
                //for ease of reference, we define the block we're looking at as a variable
                let curr = input[i];
                //Only execute if the block is NOT blank
                if (curr != 0){
                    //We find the intended row and column and the actual row and column based on their values
                    let intendedRow = Math.floor((curr - 1) / this._size);
                    let currentRow = Math.floor(i / this._size);
                    let intendedCol = (curr - 1) % this._size;
                    let currentCol = i % this._size;

                    //We calculate the distance the block is from its intended row, and the distance from its intended column
                    let rowDist = Math.abs(intendedRow - currentRow);
                    let colDist = Math.abs(intendedCol - currentCol);

                    //We add this difference to the accumulator
                    acc += rowDist + colDist;

                    //Now we're going to add linear collisions to make our estimate much closer to the reality. This means that if the block is in its intended column or row, we're going to check if the numbers to the left/above are larger than it, or numbers to the right/below are smaller than it. If so, there's a linear collision, and we'll add 2 to the accumulator for each collision.

                    //We begin this process by generating an array numbered 0 to the size of the puzzle.
                    let arr = Array.from({length: this._size}, (x, i) => i);

                    //If the block is in its intended row
                    if (!rowDist){
                        //Iterate over the array we generated earlier
                        for (let j in arr){
                            //For ease of reference, this is our test column. Technically could just be replaced with j.
                            let testCol = arr[j];
                            //Calculate value K. This is simply the index of the test block within the same row we're comparing against
                            let k = currentRow * this._size + testCol;
                            //We calculate the intended test row of the test block.
                            let intendTestRow = Math.floor((input[k] - 1)/this._size);
                            //If the row we're on ISN'T the intended test row, we skip calculating.
                            if (currentRow != intendTestRow) continue;
                            //If the column we're testing is to the left of the column we're on
                            if (testCol < currentCol){
                                //We test if the block located there is larger. If so, add two.
                                if (input[k] > curr){
                                    acc += 2;
                                }
                            } else {
                                //If the column we're testing is to the right of the column we're on
                                //We test if the block located there is smaller and is NOT the blank.
                                if (input[k] < curr && input[k] !== 0){
                                    acc += 2;
                                }
                            }
                        }
                    }

                    //We do the exact same as above but for the blocks found in the column
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
        } else {
            let moved = input[lastIndex];
            let intendedRow, currRow, lastRow, intendedCol, currCol, lastCol, rowDist, prevRowDist, colDist, prevColDist;

            let arr = Array.from({length: this._size}, (x, i) => i);
            if (isVert){
                intendedRow = Math.floor((moved - 1) / this._size);
                currCol = lastIndex % this._size;
                currRow = Math.floor(lastIndex / this._size);
                lastRow = Math.floor(blankIndex / this._size);
                rowDist = Math.abs(intendedRow - currRow);
                prevRowDist = Math.abs(intendedRow - lastRow);

                if (rowDist > prevRowDist){
                    acc++;
                } else {
                    acc--;
                }
                
                if (!rowDist){
                    for (let i in arr){
                        let testCol = arr[i];
                        let k = currRow * this._size + testCol;

                        let intendTestRow = Math.floor((input[k] - 1) / this._size);
                        if (currRow != intendTestRow) continue;

                        if (testCol < currCol){
                            if (input[k] > moved){
                                acc +=4;
                            }
                        } else {
                            if (input[k] < moved && input[k] !== 0){
                                acc +=4;
                            }
                        }
                    }
                } else if (!prevRowDist){
                    for (let i in arr){
                        let testCol = arr[i];
                        let k = lastRow * this._size + testCol;

                        let intendTestRow = Math.floor((input[k] - 1) / this._size);
                        if (lastRow != intendTestRow) continue;

                        if (testCol < currCol){
                            if (input[k] > moved){
                                acc -=4;
                            }
                        } else {
                            if (input[k] < moved && input[k] !== 0){
                                acc -=4;
                            }
                        }
                    }
                }
            } else {
                intendedCol = (moved - 1) % this._size;
                currCol = lastIndex % this._size;
                currRow = Math.floor(lastIndex / this._size);
                lastCol = blankIndex % this._size;
                colDist = Math.abs(intendedCol - currCol);
                prevColDist = Math.abs(intendedCol - lastCol);

                if (colDist > prevColDist){
                    acc++;
                } else {
                    acc--;
                }

                if (!colDist){
                    for (let i in arr){
                        let testRow = arr[i];
                        let k = currCol + testRow * this._size;
                        let intendTestCol = (input[k] - 1) % this._size;

                        if (currCol != intendTestCol) continue;

                        if (testRow < currRow){
                            if (input[k] > moved){
                                acc +=4;
                            }
                        } else {
                            if (input[k] < moved && input[k] !== 0){
                                acc +=4;
                            }
                        }
                    }
                } else if (!prevColDist){
                    for (let i in arr){
                        let testRow = arr[i];
                        let k = lastCol + testRow * this._size;

                        let intendTestCol = (input[k] - 1) % this._size;

                        if (lastCol != intendTestCol) continue;

                        if (testRow < currRow){
                            if (input[k] > moved){
                                acc -=4;
                            }
                        } else {
                            if (input[k] < moved && input[k] !== 0){
                                acc -=4;
                            }
                        }
                    }
                }
            }

        }
        //We have a secondary heuristic, inversion distance, by Ken'ichiro Takahashi. We simply count inversions in vertical moves as well as inversions in horizontal moves.
        //First we count vertical inversions.
        let inversions = 0;
        let horInversions = 0;
        
        if (isVert){
            inversions = this._inversionCount(input);
            //We divide the number of inversions by one less the size of the puzzle and add the remainder
            vert = Math.floor(inversions / (this._size - 1)) + inversions % (this._size - 1);
        }


        //To calculate the horizontal inversions we must reassign the puzle new values. So the puzzle began as such:
        //    -----------------------------
        //    |  1   |  2   |  3   |  4   |
        //    |  5   |  6   |  7   |  8   |
        //    |  9   |  10  |  11  |  12  |
        //    |  13  |  14  |  15  |  0   |
        //    -----------------------------
        
        //Which we convert to
        //    -----------------------------
        //    |  1   |  5   |  9   |  13  |
        //    |  2   |  6   |  10  |  14  |
        //    |  3   |  7   |  11  |  15  |
        //    |  4   |  8   |  12  |  0   |
        //    -----------------------------

       
        //We now use this transposed board and count inversions the same way as last time
        if (!isVert){
            horInversions = this._inversionCount(input, true);
        hor = Math.floor(horInversions / (this._size - 1)) + horInversions % (this._size - 1);
        }

        //the invert distance is the sum of both the vertical and horizontal inversions
        let invertDistance = vert + hor;

        //We take the larger of the two and use this as our heuristic.
        return [Math.max(acc, invertDistance), acc, vert, hor];
    }

    //Checks if the board is solved. Obsolete, as the heuristic function should return zero for a solved board state.
    isSolved(input = this._puzzle){
        return input.reduce((a, b, i) => a && (b == i+1 || b == 0), true);
    }

    //Returns a shallow copy of the board state when invoked
    get puzzle(){
        return [...this._puzzle];
    }

    //returns the f value, which is the sum of the heuristic value of the current boardstate and the amount of moves taken
    get f(){
        return this._f;
    }

    get blankIndex(){
        return this._blankIndex;
    }

    get MD(){
        return this._MD;
    }

    /**
     * Solves the puzzle, uses IDA* with a dual-minmax heap. I will explain further on what this means
     */
    solve(){
        let hvals = this.findH();
        //Establish an h value and set the g value to zero
        this._h = hvals[0];
        this._MD = hvals[1];
        this._invVert = hvals[2];
        this._invHor = hvals[3];
        this._g = 0;
        //Set the f value
        this._f = this._g + this._h;

        //Create a new dual-minmax heap. It will order the heap by max of g, but when there's ties it will order by the min of f. This allows us to optimize the branches we're exploring first
        let heap = new Heap([], 'max', 'g', 'f');

        //Set the initial maxDepth to 2.
        let maxDepth = 2;
        let i;
        let nodes = 0;
        //We can determine whether it'll take even or odd moves to solve based on the blankIndex. Essentially think of a checkerboard pattern being applied on the boardstate. If the blank begins on a white space and ends on a black space, it will require an odd number of moves to solve. If it starts on a black space and ends on a black space, it will require an even number of moves.
        if (this._size % 2){
            i = this._blankIndex % 2;
        } else {
            i = ((this._blankIndex) % 2 + Math.floor(this._blankIndex / this._size)) % 2;
        }
        //Because of the above, we can safely increase the max depth by 2 every time
        for (; i < maxDepth; i+=2){
            console.log(`depth: ${i}`);
            //Run the exploreStates function, which is essentially an implementation of A* that truncuates at a certain depth
            let res = this._exploreStates(i, heap);
            nodes += res[1];
            //If we don't find a solution, repeat with maxdepth +2.
            if (res[0] == false) {
                maxDepth+=2;
                continue;
            } else {
                console.log(`nodes explored: ${nodes}`);
                return res[0];
            }
        }
    }

    /**
     * exploreStates. An implementation of a IDA*. Searches a branch as deep as it can until it reaches a cutoff point as specified by maxDepth, then moves to the next branch. Uses a heap as priorityQueue
     * @param {number} maxDepth The max depth the function will explore
     * @param {Heap} heap The heap we're going to use
     * @returns {Object | boolean} If the function finds a solution, returns it. If not, returns False.
     */
    _exploreStates(maxDepth, heap){
        //Our initial state is just the original state.
        let initState = {
            state: this.puzzle,
            g: 0,
            h: this._h,
            MD: this._MD,
            invVert: this._invVert,
            invHor: this._invHor,
            moves: [],
            validMoves: this._validMovesArr,
            blankIndex: this._blankIndex,
        };
        initState.f = initState.g + initState.h;

        //Insert this into our heap
        heap.insert(initState);

        //We're going to count nodes explored now!
        let nodes = 0;

        //While our heap is not empty
        while(heap.size){
            //Pop out the top value of the heap, this is our currentState.
            let currentState = heap.pop();
            
            //If the current amount of moves plus the estimated number of moves is greater than the maxDepth, it is not worth further exploring this branch and we can close it.
            nodes++;
            if (currentState.f > maxDepth) continue;
            //Calculate the validMoves the currentState can do.
            currentState.validMoves = this.validMoves(currentState.blankIndex);

            //If the puzzle is solved, return the solution
            if (currentState.h === 0) return [currentState, nodes];
            let movelength = currentState.moves.length;


            //If the next valid move is a Right move
            if (currentState.validMoves.includes('R') && (!movelength || currentState.moves[movelength - 1] != 'L')){
                //Execute the move to the right
                let [potentialBlank, potentialMove] = this.slideRight([...currentState.state], currentState.blankIndex, [...currentState.validMoves]);

                //Create a new object with the potential new state
                let hvals = this.findH(potentialMove, potentialBlank, currentState.blankIndex, currentState.MD, currentState.invVert, currentState.invHor);
                let potentialState = {
                    state: potentialMove,
                    g: currentState.g + 1,
                    h: hvals[0],
                    MD: hvals[1],
                    invVert: hvals[2],
                    invHor: hvals[3],
                    moves: [...[...currentState.moves],'R'],
                    blankIndex: potentialBlank
                };
                potentialState.f = potentialState.g + potentialState.h;

                //Insert this into the heap, which will automatially sort it.
                heap.insert(potentialState);
            }

            if (currentState.validMoves.includes('L') && (!movelength || currentState.moves[movelength - 1] != 'R')){
                let [potentialBlank, potentialMove] = this.slideLeft([...currentState.state], currentState.blankIndex, [...currentState.validMoves]);

                let hvals = this.findH(potentialMove, potentialBlank, currentState.blankIndex, currentState.MD, currentState.invVert, currentState.invHor);
                let potentialState = {
                    state: potentialMove,
                    g: currentState.g + 1,
                    h: hvals[0],
                    MD: hvals[1],
                    invVert: hvals[2],
                    invHor: hvals[3],
                    moves: [...[...currentState.moves],'L'],
                    blankIndex: potentialBlank
                };
                potentialState.f = potentialState.g + potentialState.h;

                heap.insert(potentialState);
            }

            if (currentState.validMoves.includes('U') && (!movelength || currentState.moves[movelength - 1] != 'D')){
                let [potentialBlank, potentialMove] = this.slideUp([...currentState.state], currentState.blankIndex, [...currentState.validMoves]);

                let hvals = this.findH(potentialMove, potentialBlank, currentState.blankIndex, currentState.MD, currentState.invVert, currentState.invHor);
                let potentialState = {
                    state: potentialMove,
                    g: currentState.g + 1,
                    h: hvals[0],
                    MD: hvals[1],
                    invVert: hvals[2],
                    invHor: hvals[3],
                    moves: [...[...currentState.moves],'U'],
                    blankIndex: potentialBlank
                };
                potentialState.f = potentialState.g + potentialState.h;

                heap.insert(potentialState);
            }

            if (currentState.validMoves.includes('D') && (!movelength || currentState.moves[movelength - 1] != 'U')){
                let [potentialBlank, potentialMove] = this.slideDown([...currentState.state], currentState.blankIndex, [...currentState.validMoves]);

                let hvals = this.findH(potentialMove, potentialBlank, currentState.blankIndex, currentState.MD, currentState.invVert, currentState.invHor);
                let potentialState = {
                    state: potentialMove,
                    g: currentState.g + 1,
                    h: hvals[0],
                    MD: hvals[1],
                    invVert: hvals[2],
                    invHor: hvals[3],
                    moves: [...[...currentState.moves],'D'],
                    blankIndex: potentialBlank
                };
                potentialState.f = potentialState.g + potentialState.h;

                heap.insert(potentialState);
            }
        }
        //If the heap is empty, return false.
        return [false, nodes];
    }
}



let validBoard = [6, 13, 7, 10, 8, 9, 11, 0, 15, 2, 12, 5, 14, 3, 1, 4];
let invalidBoard = [3, 9, 1, 15, 14, 11, 4, 6, 13, 0, 10, 12, 2, 7, 8, 5];
let FourteenMove = [ 1, 2, 3, 4, 5, 11, 10, 7, 9, 6, 12, 15, 13, 14, 8, 0 ];
let Eight26Move = [ 2, 4, 0, 3, 6, 7, 5, 8, 1 ];
let LinearCollision = [1, 2, 3, 0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 4];
let SixtySixMove = [14, 15, 8, 12, 10, 11, 9, 13, 2, 6, 5, 1, 3, 7, 4, 0];
let FiftyMove = [ 4, 3, 2, 11, 5, 0, 7, 6, 10, 13, 9, 8, 15, 1, 12, 14 ];
let FiftyNineMove = [ 4, 10, 12, 0, 15, 14, 1, 2, 9, 11, 3, 6, 8, 7, 5, 13 ];

let q = new SlidePuzzle([5, 13, 1, 2, 3, 11, 14, 6, 9, 12, 0, 8, 15, 10, 4, 7]);
// console.log(q);
// q.shuffle(1000);
console.log(q);
console.log(q.findH());
let hrStart = process.hrtime();
console.log(q.solve());
let hrEnd = process.hrtime(hrStart);
hrEnd[1] /= 1000000;
console.log(`seconds: ${hrEnd[0]} ms: ${hrEnd[1]}`);


// 50 Move: Nodes: 72802 seconds: 0 ms: 470.347001
// 66 Move: Nodes: 46439316 seconds: 175 ms: 261.723429