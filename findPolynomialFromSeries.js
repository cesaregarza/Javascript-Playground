var Fraction = require('fraction.js');

class Series {
    /**
     * Constructs the new series
     * @param {number[]} arr given array
     * @param {'series' | 'polynomial'} type Type fed into array
     */
  constructor(arr, type = 'series') {
    this._poly = [];
    this._series = [];
    if (type == 'polynomial') {
        for (let i in arr) {
            this._poly.push(new Fraction(arr[i]));
        }
    } else if (type == 'series') {
        for (let i in arr) {
            this._series.push(new Fraction(arr[i]));
        }
    } else {
        throw "Invalid type";
    }
  }

  /**
   * Find Degree. Finds the degree and coefficient of the suspected polynomial that generated the series.
   * @param {Fraction[]} arr Input Series array
   * @param {number} deg Degree we're working in
   * @returns {[Fraction, number]} Returns [Coefficient, Degree]
   */
  findDegree(arr, deg = 1) {
    let arr2 = [];
    if (arr[0] == undefined) return false;
    let acc = true;
    for (let i = 1; i < arr.length; i++) {
      let g = arr[i].sub(arr[i - 1]);
      arr2.push(g);
      if (i == 1) continue;
      acc = acc && (arr2[i - 1].equals(arr2[i - 2]));
    }
    if (acc) return [new Fraction(arr2[0]), deg];
    let s = this.findDegree(arr2, deg + 1);
    return s;
  }

  /**
   * Generates an array of factorials up to n
   * @param {number} n number we want to generate our factorials up to
   */
  generateFactorials(n) {
    let arr = [1];
    for (let i = 1; i <= n; i++) {
      arr[i] = arr[i - 1] * i;
    }
    return arr;
  }

  /**
   * Generates an array size n of numbers using the given Polynomial Series and Horner's Method
   * @param {Fraction[]} arr Polynomial array
   * @param {number} n Number of terms in the series
   * @returns {Fraction[]} Returns array of the first n digits of a series
   */
  generatePolySeries(arr, n) {
    let a = [];
    for (let i = 1; i <= n; i++) {
      let q = this.horner([...arr], i);
      a.push(q);
    }
    return a;
  }

  /**
   * Horner's Method. Finds a_0+a_1*x+a_2*x^2... through recursion.
   * @param {Fraction[]} poly Polynomial input
   * @param {number} n Number around which to generate the series
   * @returns {Fraction} Returns Series
   */
  horner(poly, n) {
    let l = poly.length - 1;
    if (!l) return poly[0];
    let p = new Fraction(poly.pop());
    return p.add(this.horner(poly, n).mul(n));
  }

  /**
   * Prints the polynomial associated with the series
   * @param {Fraction[]} polyArray Polynomial you want printed
   * @param {string} variable Variable you want to represent when printed
   * @returns {void} Prints using console.log, but can be modified to just return instead.
   */
  printPolynomial(polyArray = this._poly, variable = "x") {
    let ret = "";
    let l = polyArray.length;
    for (let i in polyArray) {
        if (polyArray[i].s == -1){
            ret+=`-`;
        }
        ret += `${polyArray[i].n}`;
        if (polyArray[i].d != 1){
          ret +=`/${polyArray[i].d}`;
        }
        if (i == (l - 1)) {
            break;
        } else {
            ret += `${variable}`;
            
            if (l - i == 2) {
                ret += ` + `;
                continue;
            }
            ret += `^${l - i - 1} + `;
        }
    }
    console.log(ret);
  }

  /**
   * @returns {void} Finds the associated polynomial with the given series.
   */
  findPolynomial() {
    let poly = [];
    let factorials = this.generateFactorials(10);
    let testArr = [...this._series];
    let l = 0;
    let degree = 999;

    let _i = 0;
    do {
      if (++_i == 20) break;
      let [coefficient, tempDeg] = this.findDegree(testArr);

      if (degree == tempDeg) {
        tempDeg--;
        coefficient = new Fraction(testArr[0]);
      }

      degree = tempDeg;
      coefficient = coefficient.div(factorials[degree]);

      if (!poly.length) {
        poly = Array.from({length: degree + 1}, () => new Fraction(0));
        l = poly.length;
        poly[0] = coefficient;
      } else {
        poly[l - degree - 1] = coefficient;
      }

      let polyArr = this.generatePolySeries(poly, this._series.length);
      for (let i in polyArr) {
        let g = this._series[i].sub(polyArr[i]);
        testArr[i] = this._series[i].sub(polyArr[i]);
      }
    } while (degree);

    if (_i == 20) {
      console.log('Polynomial could not be determined');
    }
    this._poly = poly;
  }

  /**
   * @returns {void} Destroys original series, finds the summation of the series and the associated polynomial
   */
    findSummationPoly(){
        if (!this._series.length){
            this._series = this.generatePolySeries();
        }
    
        let l = this._series.length;
    
        for (let i = 1; i < l; i++){
            this._series[i]= this._series[i].add(this._series[i-1]);
        }
    
        this.findPolynomial();
        this.printPolynomial();
    }
    /**
     * Expands a series using the associated polynomial into the desired number of terms n
     * @param {number} n Number of terms wanted
     * @returns {Fraction[]} array of series
     */
  expandSeries(n) {
    if (!this._series.length) {
      this._series = this.generatePolySeries();
    }
    if (!this._poly.length) {
      this.findPolynomial();
    }

    this._series = this.generatePolySeries(this._poly, n);
    return this._series;
  }
}



let x = [4, -3, 4, -2, 5, 1];
let arr = [24, 76, 160, 276];
let arr2 = [24, 100, 260, 536, 960];
let s = new Series(arr, 'series');

s.findPolynomial();
s.printPolynomial();
s.findSummationPoly();