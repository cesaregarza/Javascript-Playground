const RubikCube = require('./RubikClass');

let colors = ['B', 'R', 'W', 'G', 'O', 'Y'];
let faces = [];
let s = 3;
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

// faces[0] = [['B1', 'B2', 'B3'], ['B4', 'B5', 'B6'], ['B7', 'B8', 'B9']];
// faces[1] = [['R1', 'R2', 'R3'], ['R4', 'R5', 'R6'], ['R7', 'R8', 'R9']];
// faces[2] = [['W1', 'W2', 'W3'], ['W4', 'W5', 'W6'], ['W7', 'W8', 'W9']];
// faces[3] = [['G1', 'G2', 'G3'], ['G4', 'G5', 'G6'], ['G7', 'G8', 'G9']];
// faces[4] = [['O1', 'O2', 'O3'], ['O4', 'O5', 'O6'], ['O7', 'O8', 'O9']];
// faces[5] = [['Y1', 'Y2', 'Y3'], ['Y4', 'Y5', 'Y6'], ['Y7', 'Y8', 'Y9']];
let hrStart = process.hrtime();
let r = new RubikCube(...faces);

r.rotateCommands("D' R' D R2");
r.rotateCommands("R2 D' R D");
let hrEnd = process.hrtime(hrStart);
hrEnd[1] /= 100000;
r.print();
console.log(`seconds: ${hrEnd[0]} ms: ${hrEnd[1]}`);