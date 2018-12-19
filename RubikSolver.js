class RubikCube {
    constructor(face0, face1, face2, face3, face4, face5){
        this._faces = [face0, face1, face2, face3, face4, face5];
        this._size = this._faces[0].length;

        this._partnership = {
            '1': [0, 2],
            '2': [4],
            '4': [3, 5],
            '5': [0, 1, 3]
        };

        this.print();
    }

    logicXor(a, b){
        return (a && !b) || (b && !a);
    }

    print(){
        console.log(`boooooooop`);
        for (let i in this._faces){
            console.log(this._faces[i]);
        }
    }

    rotateFaceLayer(faceNumber, clockwise, twice=false) {
        let partners = [];
        for (let i = 0; i < 6; i++){
            if (i%3 != faceNumber % 3){
                partners.push(i);
            }
        }

        let vert = (faceNumber % 3 > 0);
        let highlow = Math.floor(faceNumber / 3) == 1;

        this.rotateFace(faceNumber, clockwise, twice);
        
        let list = [];
        for (let i in partners){
            if (!vert){
                if (!highlow){
                    list.push(...this._faces[partners[i]][0]);
                } else {
                    list.push(...this._faces[partners[i]][this._size - 1]);
                }
            } else {
                let q = this._partnership[faceNumber].includes(partners[i]);
                let w = Math.floor(partners[i] / 3);
                let g = q ? this._size - 1 : 0;
                if (faceNumber % 3 == 1){
                    if (partners[i] % 3 == 0){
                        if (q){
                            list.push(...this._faces[partners[i]][this._size - 1]);
                        } else {
                            for (let j = this._size - 1; j >= 0; j--){
                                list.push(this._faces[partners[i]][0][j]);
                            }
                        }
                        continue;
                    } else {
                        if (!w){
                            for (let j = 0; j < this._size; j++){
                                list.push(this._faces[partners[i]][j][g]);
                            }
                        } else {
                            for (let j = this._size - 1; j >= 0; j--){
                                list.push(this._faces[partners[i]][j][g]);
                            }
                        }
                        continue;
                    }
                } else {
                    for (let j = 0; j < this._size; j++){
                        list.push(this._faces[partners[i]][j][g]);
                    }
                }
            }
        }

        let c = this.logicXor(faceNumber % 3 == 1, faceNumber >= 3);
        clockwise = c ? !clockwise : clockwise;
        let temp = twice ? 2 : 1;

        for (let k = 0; k < temp; k++){
          for (let i = 0; i < this._size; i++) {
            let g;
            if (clockwise) {
              g = list.pop();
              list.unshift(g);
            } else {
              g = list.shift();
              list.push(g);
            }
          }
        }

        for (let i in partners){
            for (let j = 0; j < this._size; j++){
                if (!vert){
                    if (!highlow){
                        this._faces[partners[i]][0][j] = list.shift();
                    } else {
                        this._faces[partners[i]][this._size - 1][j] = list.shift();
                    }
                } else {
                    let q = this._partnership[faceNumber].includes(partners[i]);
                    let g = q ? this._size - 1: 0;
                    let w = Math.floor(partners[i] / 3);

                    if (faceNumber % 3 == 1){
                        if (partners[i] % 3 == 0){
                            this._faces[partners[i]][g][j] = list.shift();
                        } else {
                            this._faces[partners[i]][j][g] = list.shift();
                        }
                    } else {
                        if (!w){
                            this._faces[partners[i]][j][g] = list.shift();
                        } else {
                            this._faces[partners[i]][this._size - 1 - j][g] = list.shift();
                        }
                    }
                }
            }
        }


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

            for (let k = 0; k < 2; k++){    
                for (let j = 1; j < this._size - 2 * i; j++){
                    let g;
                    if (!clockwise){
                        g = list.shift();
                        list.push(g);
                    } else {
                        g = list.pop();
                        list.unshift(g);
                    }
                }
                if (twice) continue;
                else break;
            }

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
}

let colors = ['B', 'R', 'W', 'G', 'O', 'Y'];
let faces = [];
let s = 4;
for (let k in colors){
    let temp = [];
    for (let i = 0; i < s; i++){
        let tempy = [];
        for (let j = 0; j < s; j++){
            tempy.push(colors[k]);
        }
        temp.push(tempy);
    }
    faces.push(temp);
}

// faces[0] = Array.from({length: s}, (x, i) => Array.from({length: s}, (y, j) => j + i * s + 1));
// faces[1] = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I']];
// faces[2] = [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']];
// faces[3] = [['10', '11', '12'], ['13', '14', '15'], ['16', '17', '18']];
// faces[4] = [['r', 's', 't'], ['u', 'v', 'w'], ['x', 'y', 'z']];
// faces[5] = [['R', 'S', 'T'], ['U', 'V', 'W'], ['X', 'Y', 'Z']];
let r = new RubikCube(...faces);
r.rotateFaceLayer(5, false, true);
// r.rotateFaceLayer(2, true);
// r.rotateFaceLayer(5, false);
// r.rotateFaceLayer(3,false);
// r.rotateFaceLayer(4, true);
r.print();