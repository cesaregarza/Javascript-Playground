const generateNDimensionalSquareGrid = (n, l) => {
    if (n){
      return Array.from({length: l}, () => generateNDimensionalSquareGrid(n - 1, l));
    } else {
      return Math.floor(Math.random() * 100);
    }
  };
  
  let gridInput = generateNDimensionalSquareGrid(2, 100);
  console.log(gridInput);
  
  const findDepth = (arr) => {
    if (typeof arr != "number"){
      return (1 + findDepth(arr[0]))
    } else return 0;
  };
  
  console.log(findDepth(gridInput));