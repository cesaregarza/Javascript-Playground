x = (input) => {
    let sqrt = Math.sqrt(input.length);
    let q = Math.abs(sqrt - Math.floor(sqrt));
    if (q >= 0.0001 ) throw "Invalid size";
    sqrt -= q;

    return sqrt;
};

let y = (input) => {
    return Array.from({length: input ** 2});
};

for (var i = 1; i < 1000; i++){
    if (x(y(i)) != i) break;
}
console.log(i);

