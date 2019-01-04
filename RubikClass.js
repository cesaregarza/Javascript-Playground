class RubikCube {
    /**
     * Constructor. Creates the cube and establishes relevant internal values
     * @param {Array} face0 Top face Array
     * @param {Array} face1 Front face Array
     * @param {Array} face2 Left face Array
     * @param {Array} face3 Bottom face Array
     * @param {Array} face4 Back face Array
     * @param {Array} face5 Right face Array
     */
    constructor(face0, face1, face2, face3, face4, face5){
        this._faces = [face0, face1, face2, face3, face4, face5];
        //The size of the cube. 
        this._size = this._faces[0].length;

        //Each rotation about a face will rotate either the "high" or "low" part of the matrix. 
        //This partnership enumerates the "high" parts that are rotated for each face
        this._partnership = {
            '1': [0, 2],
            '2': [4],
            '4': [3, 5],
            '5': [0, 1, 3]
        };

        //Establishes a relationship between human-readible moves and computer-readible moves.
        this._layers = {
            'U': 0,
            'F': 1,
            'L': 2,
            'D': 3,
            'B': 4,
            'R': 5
        };

        // this.print();
    }

    /**
     * Logical XOR, runs XOR on two booleans.
     * @param {boolean} a First value
     * @param {boolean} b Second Value
     * @returns {boolean} Returns the XOR of both booleans A and B.
     */
    logicXor(a, b){
        return (a && !b) || (b && !a);
    }

    checkIfSolved(){
        for (let i = 0; i < 6; i++){
            let color;
            for(let j = 0; j < this._size; j++){
                for (let k = 0; k < this._size; k++){
                    if (j == 0 && k == 0){
                        color = this._faces[i][j][k];
                        continue;
                    }
                    if (this._faces[i][j][k] != color){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Prints the cube's current state
     */
    print(){
        console.log(`boooooooop`);
        for (let i in this._faces){
            console.log(this._faces[i]);
        }
    }

    rotateCommands(string){
        let list = string.split(' ');
        for (let i in list){
            this.rotate(list[i]);
        }
    }

    /**
     * Rotate command, makes it easier to set up algorithms by using human-readable inputs and converting to something the computer can use.
     * @param {string} string String containing the rotation command. Allowed Inputs: 2R, r, 2R', r', 2R2, r2
     */
    rotate(string){
        //Regex detects: 2R, r, 2R', r', 2R2, r2, etc
        let re = /^(?<matcher>(?<layer>[0-9]*)(?<face>[UFLDBR]{1})|[ufldbr])(?<direction>['2]?)/g;
        
        //Execute
        let arr = re.exec(string);
        if (!arr) throw "invalid";

        let clockwise = true;
        let twice = false;

        if (arr.groups.direction == `'`){
            clockwise = false;
        } else if (arr.groups.direction == '2'){
            twice = true;
        }

        //If the groups layer OR face are undefined, we can assume the command is u, f, l, d, b, or r.  
        if (!arr.groups.layer && !arr.groups.face){
            //Set to uppercase
            let face = arr.groups.matcher.toUpperCase();
            //Convert command face to number
            let faceNum = this._layers[face];
            //Establish what half the cube is
            let halfSize = this._size / 2;

            //Iterate for each layer.
            for (let i = 1; i <= halfSize; i++){
                this.rotateFaceLayer(faceNum, i, clockwise, twice);
                this.print();
            }
        } else {
            //Convert command face to number
            let faceNum = this._layers[arr.groups.face];

            //If no number is found ahead of R, assume it's only the outermost layer and set it to 1.
            if (arr.groups.layer === ""){
                arr.groups.layer = 1;
            }

            //Parse the layer number.
            let i = parseInt(arr.groups.layer);
            this.rotateFaceLayer(faceNum, i, clockwise, twice);
        }

    }

    rotateFaceLayer(faceNumber, layer, clockwise, twice=false) {

        if (layer == 1){
            this.rotateFace(faceNumber, clockwise, twice);
        }
        this.rotateLayer(faceNumber, layer, clockwise, twice);
    }

    rotateFace(faceNumber, clockwise = true, twice=false){

        for (let i = 0; i < (this._size / 2); i++){
            let list = [];
            //Map layer to a list
            for (let j = i; j < this._size - i; j++){
                list.push(this._faces[faceNumber][i][j]);
            }
            for (let j = i + 1; j < this._size - i; j++){
                list.push(this._faces[faceNumber][j][this._size - i - 1]);
            }
            for (let j = this._size - i - 2; j >= i; j--){
                list.push(this._faces[faceNumber][this._size - i - 1][j]);
            }
            for (let j = this._size - i - 2; j > i; j--){
                list.push(this._faces[faceNumber][j][i]);
            }

            //Rotate list
            let size = (this._size - 1 - (2 * i));
            if (twice){
                list = this._rotateList(list, clockwise, size);
            }
            list = this._rotateList(list, clockwise, size);

            //Reassign layer
            for (let j = i; j < this._size - i; j++){
                this._faces[faceNumber][i][j] = list.shift();
            }
            for (let j = i + 1; j < this._size - i; j++){
                this._faces[faceNumber][j][this._size - i - 1] = list.shift();
            }
            for (let j = this._size - i - 2; j >= i; j--){
                this._faces[faceNumber][this._size - i - 1][j] = list.shift();
            }
            for (let j = this._size - i - 2; j > i; j--){
                this._faces[faceNumber][j][i] = list.shift();
            }
        }
    }

    rotateLayer(faceNumber, layerNumber, clockwise = true, twice = false){
        let partners = [];
        for (let i = 0; i < 6; i++){
            if (i%3 != faceNumber % 3){
                partners.push(i);
            }
        }

        //Vert is true if the rotation involves array columns, aka not face 0 or 3.
        let vert = (faceNumber % 3 > 0);
        //True if face rotating is [3, 4, 5] and false if it's [0, 1, 2]
        let highlow = Math.floor(faceNumber / 3) == 1;
        layerNumber--;

        //Make a list where we'll rotate.
        let list = [];

        //Populate list
        for (let i in partners){
            //If face is 0 or 3
            if (!vert){
                //Because we're rotating faces 0 or 3, we can grab an entire row.
                if (!highlow){
                    list.push(...this._faces[partners[i]][layerNumber]);
                } else {
                    list.push(...this._faces[partners[i]][this._size - 1 - layerNumber]);
                }
            } else {
                //Check if the current face we're working on is part of the "partnerships".
                let q = this._partnership[faceNumber].includes(partners[i]);
                //Establish whether the face we're working with is "high" or "low".
                let w = Math.floor(partners[i] / 3);
                //Set up a variable 'g' that for "high" values starts from the end, and for "low" values starts normally
                let g = q ? this._size - 1 - layerNumber : layerNumber;

                //If the rotation is about face 1 or 4
                if (faceNumber % 3 == 1){
                    //If the face we're working with is 0 or 3
                    if (partners[i] % 3 == 0){
                        //If the face we're working on is part of the "partnerships"
                        if (q){
                            //Just grab the row
                            list.push(...this._faces[partners[i]][this._size - 1 - layerNumber]);
                        } else {
                            //Otherwise, grab the row in reverse
                            for (let j = this._size - 1; j >= 0; j--){
                                list.push(this._faces[partners[i]][layerNumber][j]);
                            }
                        }
                        continue;
                    } else {
                        //If the face is "low"
                        if (!w){
                            //Grab the values in order
                            for (let j = 0; j < this._size; j++){
                                list.push(this._faces[partners[i]][j][g]);
                            }
                        } else {
                            //Grab the values in reverse order
                            for (let j = this._size - 1; j >= 0; j--){
                                list.push(this._faces[partners[i]][j][g]);
                            }
                        }
                        continue;
                    }
                } else {
                    //If the rotation is about face 2 or 5
                    //Just grab normally
                    if (!w || partners[i] == 3){
                        for (let j = 0; j < this._size; j++){
                            list.push(this._faces[partners[i]][j][g]);
                        }
                    } else {
                        for (let j = this._size - 1; j >= 0; j--){
                            list.push(this._faces[partners[i]][j][g]);
                        }
                    }
                }
            }
        }

        //Temporary variable that will XOR if the rotation is about a "high" face and is face 1 or 4
        let c = this.logicXor(faceNumber % 3 == 1, faceNumber >= 3);
        //If this is the case, then invert the direction of rotation
        clockwise = c ? !clockwise : clockwise;

        //If the rotation is to be done twice, execute a rotation now
        if(twice){
            list = this._rotateList(list, clockwise);
        }
        //Rotate the list
        list = this._rotateList(list, clockwise);

        //Place values from the rotated list
        //Iterate through all partners
        for (let i in partners){
            //Establish a variable j. Doing it like this reduces our number of loops we'll have to go through.
            for (let j = 0; j < this._size; j++){
                //If the rotation was about faces 0 or 3
                if (!vert){
                    //If rotation was about face 0
                    if (!highlow){
                        //Place starting from j = 0
                        this._faces[partners[i]][layerNumber][j] = list.shift();
                    } else {
                        //Place in reverse, starting from j = this._size
                        this._faces[partners[i]][this._size - 1 - layerNumber][j] = list.shift();
                    }
                } else {
                    //This section is nearly identical to where you grab from
                    let q = this._partnership[faceNumber].includes(partners[i]);
                    let g = q ? this._size - 1 - layerNumber: layerNumber;
                    let w = Math.floor(partners[i] / 3);

                    if (faceNumber % 3 == 1){
                        if (partners[i] % 3 == 0){
                            this._faces[partners[i]][g][j] = list.shift();
                        } else {
                            this._faces[partners[i]][j][g] = list.shift();
                        }
                    } else {
                        if (!w || partners[i] == 3){
                            this._faces[partners[i]][j][g] = list.shift();
                        } else {
                            this._faces[partners[i]][this._size - 1 - j][g] = list.shift();
                        }
                    }
                }
            }
        }
    }

    _rotateList(list, clockwise, size = this._size){
        let g;
        // console.log(list);

        if (clockwise){
            g = list.splice(size * -1, size);
            return g.concat(list);
        } else {
            g = list.splice(0, size);
            return list.concat(g);
        }
    }

    /**
     * Rotate Cube. Rotates entire cube alongside a given axis.
     * @param {string} input Axis about which to rotate. Valid inputs: x, y, z, x', x2, etc.
     */
    rotateCube(input){
        let re = /^(?<type>[xyz]{1})(?<direction>['2]?)/g;
        
        let arr = re.exec(input);
        if (!arr) throw 'invalid rotation';

        let [clockwise, twice] = [true, false];

        if (arr.groups.direction == "'"){
            clockwise = false;
        }

        if (arr.groups.direction == '2'){
            twice = true;
        }
        let k = [...this._faces];
        
        if (arr.groups.type == 'x'){
            this.rotateFace(2,!clockwise, twice);
            this.rotateFace(5, clockwise, twice);
            if (!twice){
                if (!clockwise){
                    this._faces[0] = k[4];
                    this.rotateFace(0, true, true);
                    this._faces[1] = k[0];
                    this._faces[3] = k[1];
                    this._faces[4] = k[3];
                    this.rotateFace(4, true, true);
                } else {
                    this._faces[0] = k[1];
                    this._faces[1] = k[3];
                    this._faces[3] = k[4];
                    this.rotateFace(3, true, true);
                    this._faces[4] = k[0];
                    this.rotateFace(4, true, true);
                }
            } else {
                this._faces[0] = k[3];
                this._faces[1] = k[4];
                this.rotateFace(1, true, true);
                this._faces[3] = k[0];
                this._faces[4] = k[1];
                this.rotateFace(4, true, true);
            }
        } else if (arr.groups.type == 'y'){
            this.rotateFace(0, clockwise, twice);
            this.rotateFace(3, !clockwise, twice);
            if (!twice){
                if (clockwise){
                    this._faces[1] = k[5];
                    this._faces[2] = k[1];
                    this._faces[4] = k[2];
                    this._faces[5] = k[4];
                } else {
                    this._faces[1] = k[2];
                    this._faces[2] = k[4];
                    this._faces[4] = k[5];
                    this._faces[5] = k[1];
                }
            } else {
                this._faces[1] = k[4];
                this._faces[2] = k[5];
                this._faces[4] = k[1];
                this._faces[5] = k[2];
            }
        } else {
            this.rotateFace(1, clockwise, twice);
            this.rotateFace(4, !clockwise, twice);
            if (!twice){
                if(!clockwise){
                    this._faces[0] = k[5];
                    this.rotateFace(0, false, false);
                    this._faces[2] = k[0];
                    this.rotateFace(2, false, false);
                    this._faces[3] = k[2];
                    this.rotateFace(3, false, false);
                    this._faces[5] = k[3];
                    this.rotateFace(5, false, false);
                } else {
                    this.faces[0] = k[2];
                    this.rotateFace(0, true, false);
                    this.faces[2] = k[3];
                    this.rotateFace(2, true, false);
                    this._faces[3] = k[5];
                    this.rotateFace(3, true, false);
                    this._faces[5] = k[0];
                    this.rotateFace(5, true, false);
                }
            } else {
                this._faces[0] = k[3];
                this.rotateFace(0, true, true);
                this._faces[2] = k[5];
                this.rotateFace(2, true, true);
                this._faces[3] = k[0];
                this.rotateFace(3, true, true);
                this._faces[5] = k[2];
                this.rotateFace(5, true, true);
            }
        }

        
    }

    get faces(){
        return this._faces;
    }
    get size(){
        return this._size;
    }

    findH(){
        
    }
}

module.exports = RubikCube;