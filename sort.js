inlets = 2;
outlets = 4;

/**
 * @type {Array<number> | Array<string>} global array to sort
 */
var array = [];
var arrayForIndicateMoving = [];
var isFinished = false;

var currentIndexI = 0;
var currentIndexJ = 0;
var currentIndexK = 0;

/**
 * Sort the input list
 * @inlet {bang} array - The title of the book.
 * @outlet1 {undefined} - sorted sequence
 * @outlet2 {undefined} - sorted sequence
 * @outlet3 {undefined} - sorted sequence
 */
function bubbleSortEachStep() {
  if (currentIndexI == currentIndexJ) {
    currentIndexJ = array.length - 1;
    currentIndexI++;
    if (currentIndexI == array.length - 1) {
      isFinished = true;
    }
    return;
  }
  leftIndex = Math.max(currentIndexJ - 1, 0);
  if (array[currentIndexJ] < array[leftIndex]) {
    // swap
    var tmp = array[leftIndex];
    array[leftIndex] = array[currentIndexJ];
    array[currentIndexJ] = tmp;
    if (currentIndexJ === 1) {
      print(tmp);
    }
  }
  currentIndexJ--;
  // arrayForIndicateMoving[leftIndex + 1] = 0;
  // arrayForIndicateMoving[leftIndex] = array[leftIndex];
  post(
    "current index i =",
    currentIndexI,
    "current index j =",
    currentIndexJ,
    "\n"
  );
  return array[currentIndexJ];
}

var currentMin = 0;
function selection_sort(array) {
  // init
  if (currentIndexI == -0 && currentIndexJ == 0) {
    currentMin = array[currentIndexI];
    currentIndexK = currentIndexI;
    currentIndexJ = currentIndexI + 1;
  }
  // end
  if (currentIndexI == array.length) {
    isFinished = true;
    return;
  }
  if (currentIndexJ == array.length) {
  }

  if (currentMin > array[currentIndexJ]) {
    // update minimum
    currentMin = array[currentIndexJ];
    currentIndexK = currentIndexJ;
  }
  //現段階の最小値を仮保存
  var tmp = array[currentIndexI];
  //実際の最小値を一番左へ
  array[currentIndexI] = array[currentIndexK];
  //現段階の最小値を交換
  array[currentIndexK] = tmp;
  currentIndexJ++;

  currentMin = array[currentIndexI];

  //配列の数だけループする
  for (let i = 0; i < array.length; i++) {
    //最小値を一番右の値と仮定
    let min = array[i];
    //最小値の配列の添字も保存
    let k = i;
    //配列の隣の位置から最後まで最小値との比較を繰り返す。
    for (let j = i + 1; j < array.length; j++) {
      //最小値の方が大きかったら、その値が最小値になる。
      if (min > array[j]) {
        min = array[j];
        //最小値のある添字も更新
        k = j;
      }
    }
    //現段階の最小値を仮保存
    let tmp = array[i];
    //実際の最小値を一番左へ
    array[i] = array[k];
    //現段階の最小値を交換
    array[k] = tmp;
  }
  return array[currentIndexJ];
}

function quickSortEachStep() {
  if (currentIndexI == currentIndexJ) {
    currentIndexJ = array.length - 1;
    currentIndexI++;
    if (currentIndexI == array.length - 1) {
      isFinished = true;
    }
    return;
  }
  leftIndex = Math.max(currentIndexJ - 1, 0);
  if (array[currentIndexJ] < array[leftIndex]) {
    // swap
    var tmp = array[leftIndex];
    array[leftIndex] = array[currentIndexJ];
    array[currentIndexJ] = tmp;
    if (currentIndexJ === 1) {
      print(tmp);
    }
  }
  currentIndexJ--;
  // arrayForIndicateMoving[leftIndex + 1] = 0;
  // arrayForIndicateMoving[leftIndex] = array[leftIndex];
  post(
    "current index i =",
    currentIndexI,
    "current index j =",
    currentIndexJ,
    "\n"
  );
  return array[currentIndexJ];
}

var myval = 0;

if (jsarguments.length > 1) myval = jsarguments[1];

/**
 * increment the step of sorting
 */
function bang() {
  currentMovingValue = bubbleSortEachStep();
  outlet(0, array);
  outlet(1, arrayForIndicateMoving);
  outlet(2, currentMovingValue);
  if (isFinished) {
    post("sort finished\n");
    outlet(3, "bang");
  }
}

function initIndices() {
  currentIndexI = 0;
  currentIndexJ = 0;
  currentIndexK = 0;
  isFinished = false;
}

function list() {
  array = arrayfromargs(arguments);
  arrayForIndicateMoving = Array();
  for (var i = 0; i < array.length; i++) {
    arrayForIndicateMoving.push(0.001);
  }
  initIndices();

  sortAlgorithm = "bubble";
  if (sortAlgorithm === "bubble") {
    currentIndexI = 0;
    currentIndexJ = array.length;
  }

  post("initialized:", array, "\n");
  outlet(0, array);
  outlet(1, arrayForIndicateMoving);
}

function msg_int(v) {
  post("Not support int input: " + v + "\n");
  myval = v;
}

function msg_float(v) {
  post("Not support float input: " + v + "\n");
}

function anything() {
  var a = arrayfromargs(messagename, arguments);
  post("Received message not supported: " + a + "\n");
  myval = a;
}
