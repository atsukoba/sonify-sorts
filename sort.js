/**
 * Sort the input list
 * Atsuya Kobayashi 2022-02
 *
 * notes: Comments below are not following the JSDoc style. This is
 * just JSDoc-like hints for helping you figure out the behaviour
 * of Max [JS] object.
 *
 * @inlet0 {list{int}} set sequence to sort
 * @inlet0 {bang} move forward the sorting step
 * @inlet0 {message "set"} set the sort algorithm to use
 * @inlet0 {message "dump"} outlet the history of steps of sorting
 * @inlet1 - reserved inlet
 * @outlet0 @type {Array<Number>} sorted sequence
 * @outlet1 @type {Array<Number>} moving and adjacent values
 * @outlet2 @type {Array<Array<Number>} dump of sequences of sorting steps
 * @outlet3 @type {Array<Array<Number>} dump of moving values of sorting steps
 * @outlet4 @type {string} log message
 * @outlet5 reserved outlet
 * @outlet6 @type {string} bangs when the sorting animation
 */

inlets = 2;
outlets = 7;

availableAlgorithms = ["bubble", "selection", "insertion", "quick"];
if (jsarguments.length > 1) myval = jsarguments[1];

var bangCount = 0;
var array = Array();
var arrayHistory = Array();
var pointerHistory = Array();
var selectedAlgorithm = "bubble";

function bubbleSort(array) {
  for (var i = 0; i < array.length; i++) {
    for (var j = array.length; i < j; j--) {
      pointerHistory.push([
        array[Math.max(0, j - 1)],
        array[j],
        array[Math.min(array.length - 1, j + 1)],
      ]);
      if (array[j] < array[j - 1]) {
        var tmp = array[j - 1];
        array[j - 1] = array[j];
        array[j] = tmp;
      }
      arrayHistory.push(array.slice());
    }
  }
}

function selection_sort(array) {
  for (var i = 0; i < array.length; i++) {
    var min = array[i];
    var k = i;
    for (var j = i + 1; j < array.length; j++) {
      if (min > array[j]) {
        min = array[j];
        k = j;
        pointerHistory.push([
          array[Math.max(0, j - 1)],
          array[j],
          array[Math.min(array.length - 1, j + 1)],
        ]);
        arrayHistory.push(array.slice());
      }
    }
    var tmp = array[i];
    array[i] = array[k];
    array[k] = tmp;
  }
}

function quickSort(startIdx, endIdx) {
  //minからmaxの範囲からrandomな数を選ぶ関数
  function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
  var randomInt = getRandomArbitrary(startIdx, endIdx);
  //ピボットをランダムな数に指定
  var pivot = array[randomInt];
  //引数を左端、右端として変数にいれる
  var left = startIdx;
  var right = endIdx;

  //ピポットより小さい値を左側へ、大きい値を右側へ分割する
  while (true) {
    //leftの値がpivotより小さければleftを一つ右へ移動する
    while (array[left] < pivot) {
      left++;
    }
    //rightの値がpivotより小さければrightを一つ左へ移動する
    while (pivot < array[right]) {
      right--;
    }
    //leftとrightの値が同じだったら、そこでグループ分けの処理を止める。
    //rightとrightの値が同じになっていない場合、つまりグループが左右逆になっている場合、leftとrightを交換
    //交換後にleftを後ろへ、rightを前へ一つ移動する
    if (right <= left) {
      break;
    } else {
      var tmp = array[left];
      array[left] = array[right];
      array[right] = tmp;
      left++;
      right--;
      pointerHistory.push([array[left], array[right]]);
      arrayHistory.push(array.slice());
    }
  }

  //左側に分割Sるデータがある場合、quick_sort関数を呼び出す。
  if (startIdx < left - 1) {
    quickSort(startIdx, left - 1);
  }
  //右側に分割Sるデータがある場合、quick_sort関数を呼び出す。
  if (right + 1 < endIdx) {
    quickSort(right + 1, endIdx);
  }
}

function insertionSort(array) {
  for (var i = 1; i < array.length; i++) {
    var j;
    //挿入する値をいったん変数に保存
    var tmp = array[i];
    //整列ずみのどの部分に挿入するか、整列済みの分だけ整列済みの大きい方から順にループ
    for (j = i - 1; j >= 0; j--) {
      //挿入する変数tmpが、整列済みの変数array[j]より大きい場合、そのままループから抜け出すbreak
      if (tmp > array[j]) {
        break;
      } else {
        //挿入する変数tmpが整列済みの変数array[j]より小さい場合、array[j]の添字が一個増えたところにarray[j]の値を保存。
        array[j + 1] = array[j];
      }
      arrayHistory.push(array.slice());
      pointerHistory.push([
        array[Math.max(0, j - 1)],
        array[j],
        array[Math.min(array.length - 1, j + 1)],
      ]);
    }
    //breakした場合、挿入する値はarray[j+1]に
    array[j + 1] = tmp;
  }
}

/**
 * increment the step of sorting
 */
function bang() {
  outlet(0, arrayHistory[bangCount]);
  outlet(1, pointerHistory[bangCount]);
  bangCount++;

  if (bangCount == arrayHistory.length - 1) {
    outlet(6, "bang");
    bangCount = 0;
  }
}

function dump() {
  outlet(2, arrayHistory);
  outlet(3, pointerHistory);
}

function set() {
  alg = String(arrayfromargs(arguments));
  if (availableAlgorithms.indexOf(alg) === -1) {
    post("input algorithms:", alg, "is not available\n");
  } else {
    selectedAlgorithm = alg;
    post("algorithm set to:", alg, "\n");
  }
}

function initStoredHistories() {
  arrayHistory = Array();
  pointerHistory = Array();
  bangCount = 0;
}

function list() {
  array = arrayfromargs(arguments);
  initStoredHistories();
  outlet(0, array);
}

function sort() {
  outlet(4, "set Now Sorting...");
  post("Now sorting with", alg, "\n");

  if (array.length === 0) {
    post("set the sequence list to sort in first inlet\n");
  } else if (arrayHistory.length !== 0){
    array = arrayHistory[0];
    initStoredHistories();
  }
  if (selectedAlgorithm === "bubble") {
    bubbleSort(array);
  }
  if (selectedAlgorithm === "selection") {
    selection_sort(array);
  }
  if (selectedAlgorithm === "quick") {
    quickSort(array);
  }
  if (selectedAlgorithm === "insertion") {
    insertionSort(array);
  }
  if (selectedAlgorithm === "quick") {
    quickSort(array);
  }
  if (selectedAlgorithm === "quick") {
    quickSort(array);
  }
  post("Done! in ", pointerHistory.length, " steps\n");
  outlet(4, "set");
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
