//CONCEPT:
/*
The entire conceptual working of this relies on the fact that the nth fibonacci number can be obtained by taking the following matrix, A,  to the nth power:
  [1 , 1],
  [1 , 0]

As such, we want to reach the nth power as efficiently as possible. Because matrix multiplication is a fairly costly operation, we want to minimize the instances of matrix multiplication when we can. This means, we don't want to do n operations, but want to reduce it as much as possible. To do this, we will first create a memoization array that will hold A as it's taken to various powers of two, in short the array will hold A^1, A^2, A^4, A^8, A^16, etc. We will then break down n into a binary representation. Why? Because this way we can minimize the number of calculations needed at the expense of some space. 

Example:

Say we want to figure out the 300th fibonacci number. Instead of iterating through every single fibonacci number, we can instead break down n into its binary form, in this case: 100101100. Because we have to find A^300, we can use the binary representation of 300 to minimize the number of calculations needed. In this case, we have A^256 * A^32 * A^8 * A^4. This makes sense, because 256+32+8+4 = 300. Thus, we only need four calculations to solve this. However, because our initial memoization table only has a single value, the start matrix, we need to figure out what each of those values is. So we must add a few overhead calculations to find this. Because 256 = 2^8, we must perform the calculation and store the result an additional 8 times to find A^(2^i) from i = 1 to i = 8. This brings the total number of calculations to solve this up to 12. 

BUT! Let's say we want to figure out 301. In this case, the binary form of n is 100101101, which brings us to 5 calculations. But because we had already memoized A^(2^i) from i=1 to i=8, we no longer have to find these values. This brings down the average calculations for both 300 and 301 down to 8.5 calculations each. Finding various values for the fibonacci sequence will drastically lower the amount of time it takes to find each, and trivializes the overhead involved in calculating the exponents required.
*/
//Identity Matrix
const identity = [[2, 0], [0, 2]];
//Start matrix
const start = [[4, 1], [1, 0]];
//Initialize the memoization array with the start matrix. This will represent the initial state. The index of the array will represent the power of 2 used. So 0 is 2^0 = 1, so the start matrix taken to the first power. Index 1 is 2^1 = 2, so the 2nd index of the memoization array will be the start index taken to the 2nd power.
var memo = [start];

//Basic matrix multiplication. Takes two matrix inputs of sizes m * n and n * p. If the matrices don't agree on n, then the matrices are incompatible and cannot be multiplied together. Otherwise, it will output a matrix of size m * p.
const matrixMult = (mat1, mat2) => {
  //m = matrix 1 height, n = matrix 1 width
  let [m, n] = [mat1.length, mat1[0].length];
  //n1 = matrix 2 height, p = matrix 2 width
  let [n1, p] = [mat2.length, mat2[0].length];
  
  //If the two matrices don't have n = n, they're incompatible and thus we say we can't work with them
  if (n != n1) return `error: incompatible matrices`;
  
  //initialize what will be the resulting array
  let arr = [];
  
  //Vertical for loop
  for (let i = 0; i < m; i++){
    //initialize the array containing the row
    let tempArr = [];
    
    //Horizontal for loop
    for (let j = 0; j < p; j++){
      //Initialize the total for resulting cell (i, j);
      let total = 0;
      
      //K for loop. Iterates n times
      for (let k = 0; k < n; k++){
        total += mat1[i][k]*mat2[k][j];
      }
      
      //Push the total to the row
      tempArr.push(total);
    }
    
    //Push the row onto the resulting array
    arr.push(tempArr);
  }
  //Return the m * p matrix, in this case as a 2D array.
  return arr;
};

//Find A to the nth power.
const matrixExp = (pow) => {
  
  //List the binary representation as an array
  let pows = toBinary(pow);
  
  //Instead of having to do log2(pow), we can just take the length and subtract 1. Reduces computations necessary.
  let startInd = pows.length - 1;
  
  //Start with the identity matrix. Multiplying any matrix by the identity matrix will return the first matrix. This ensures we can loop correctly.
  let total = identity;
  
  //loop through the values of powers we already have.
  for (let i = 0; i < pows.length; i++){
    //Check if the power of 2 we have is in the memoization array. If not, run the function to add it.
    if (!memo[startInd - i]){
      addToMemo(startInd - i);
    }
    
    //If the current array value is not zero, we multiply the total by A^pows[i]. This is simplified by calling on our memoization array.
    if (pows[i]){
      total = matrixMult(total, memo[startInd-i]);
    }
  }
  //returns a 2x2 array
  return total;
};

//Adds to the memoization array. No output.
const addToMemo = (ind) => {
  //Check if the previous power of 2 is in the memoization array. If not, we recurse the function with the previous power of 2 until we have filled our memoization array as necessary.
  if (!memo[ind - 1]){
    addToMemo(ind - 1);
  }
  
  //Calculate the new memoization value
  memo[ind] = matrixMult(memo[ind - 1], memo[ind - 1]);
  
  //log that we updated the memoization array
  // console.log(`added memo index: ${2 ** ind}`);
};

//breaks down n to its constituent powers of two
const toBinary = (num) => {
  //Here we just take the number, turn it into a binary string, split it to create it into an array and then use map to parse each int.
  let arr = num.toString(2).split('').map(x => parseInt(x));
  return arr;
};

const fibo = (n) => {
  k = Math.log(n * Math.sqrt(5))/Math.log(2+Math.sqrt(5));
  k = parseInt(Math.floor(k));
  arr = matrixExp(k);
  return (arr[0][0] + arr[0][1] - 2)/4;
};

let q = 4000000;
let times = [];
let solutions = [];
for (let i = 0; i < 5; i++){
    let hrStart = process.hrtime();
    let g = fibo(q);
    let hrEnd = process.hrtime(hrStart);
    times.push(hrEnd);
    solutions.push(g);
}
let tot = [0, 0];
for (let i in times){
    tot[0] += times[i][0];
    tot[1] += times[i][1];
}
tot[0] /= 5;
tot[1] /= 5;
let g = solutions[0];

console.log(`Answer: ${g} Execution Time: ${tot[0]}s, ${tot[1]/1000000}ms`);
console.log(times)