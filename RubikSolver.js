class RubikCube {
    constructor(face0, face1, face2, face3, face4, face5){
        this._faces = [face0, face1, face2, face3, face4, face5];
        this._size = this._faces[0].length;
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
        let highlow = Math.floor(faceNumber / 3);

        this.rotateFace(faceNumber, clockwise, twice);
        
        let list = [];
        for (let i in partners){
            if (!vert){
                if (!highlow){
                    list.push(...this._faces[i][0]);
                } else {
                    list.pop(...this._faces[i][this._size - i]);
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
let s = 5;
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

faces[0] = Array.from({length: s}, (x, i) => Array.from({length: s}, (y, j) => j + i * s + 1));
let r = new RubikCube(...faces);
r.rotateFaceLayer(0, false, true);