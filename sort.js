/**
 * Sort the input list
 * Atsuya Kobayashi 2022-02
 *
 * notes: Comments below are not following the JSDoc style. This is
 * just JSDoc-like hints for helping you figure out the behaviour
 * of Max [JS] object.
 * @typedef {Array<Number>} Sequence
 * @typedef {Array<Number>} MidiNotes
 * @typedef {Number} Access
 * @typedef {Array<Number>} Swap the first element is 0
 * @typedef {Array<Number>} Insert the first element is 1
 *
 * @inlet0 {list{int}} set sequence to sort
 * @inlet0 {bang} move forward the sorting step
 * @inlet0 {message "set"} set the sort algorithm to use
 * @inlet0 {message "dump"} outlet the history of steps of sorting
 * @inlet1 reserved inlet
 * @outlet0 @type {Sequence} sorted sequence
 * @outlet1 @type {MidiNotes} moved/accessed and adjacent values
 * @outlet2 @type {Sequence} indicate accesed index
 * @outlet3 @type {Array<Insert|Swap|Access>} dump of moving values of sorting steps
 * @outlet4 @type {string} log message
 * @outlet5 reserved outlet
 * @outlet6 @type {string} bangs when the sorting animation
 */

inlets = 2;
outlets = 7;

if (jsarguments.length > 1) myval = jsarguments[1]; // get the arg

var isDebug = false;
var availableAlgorithms = [
  "bubble",
  "selection",
  "insertion",
  "quick",
  "merge",
];
var selectedAlgorithm = "bubble";

/**
 * @type {Number}
 */
var bangCount = 0;
/**
 * @type {Sequence}
 */
var inputArray = Array();
/**
 * @type {Sequence}
 */
var playSequence = Array();
/**
 * @type {Sequence}
 */
var pointerSequence = Array();
/**
 * @type {Array<Swap|Access}>} array of indices
 */
var stepHistory = Array();

function debug_log(msg) {
  if (isDebug) {
    post("DEBUG:", msg, "\n");
  }
}

function isInteger(num) {
  return (num ^ 0) === num;
}

function insert(array, i, j, saveHistory) {
  array[i] = array[j];
  if (saveHistory) {
    stepHistory.push([1, i, j]);
  }
}

function insertValue(array, i, value, saveHistory) {
  array[i] = value;
  if (saveHistory) {
    stepHistory.push([2, i, value]);
  }
}

function swap(array, i, j, saveHistory) {
  tmp = array[i];
  array[i] = array[j];
  array[j] = tmp;
  if (saveHistory) {
    stepHistory.push([0, i, j]);
  }
}

function bubbleSort(array) {
  for (var i = 0; i < array.length; i++) {
    for (var j = array.length; i < j; j--) {
      if (array[j] < array[j - 1]) {
        swap(array, j - 1, j, true);
        // stepHistory.push([0, j - 1, j]);
      }
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
      }
      stepHistory.push(j);
    }
    swap(array, i, k, true);
  }
}

function insertionSort(array) {
  for (var i = 1; i < array.length; i++) {
    var tmp = array[i];
    for (var j = i - 1; j >= 0; j--) {
      stepHistory.push(j);
      if (array[j] > tmp) {
        array[j + 1] = array[j];
        insert(array, j + 1, j, true);
      } else {
        break;
      }
    }
    insertValue(array, j + 1, tmp, true);
  }
}

function quickSort(array, startID, endID) {
  var pivot = array[Math.floor((startID + endID) / 2)];
  var left = startID;
  var right = endID;
  while (true) {
    while (array[left] < pivot) {
      left++;
    }
    while (pivot < array[right]) {
      right--;
    }
    if (right <= left) {
      break;
    }
    var tmp = array[left];
    swap(array, left, right, true);
    insertValue(array, right, tmp, true);
    left++;
    right--;
  }
  if (startID < left - 1) {
    quickSort(array, startID, left - 1);
  }
  if (right + 1 < endID) {
    quickSort(array, right + 1, endID);
  }
}

function mergeSort(array, start, end) {
  if (start + 1 == end) {
    stepHistory.push(start);
  } else {
    var mid = Math.floor((start + end) / 2);
    mergeSort(array, start, mid);
    mergeSort(array, mid, end);
    var temp = new Array();
    var lt = start;
    var rt = mid; 
    for (i = 0; i < end - start; i++) {
      var w;
      if (lt >= mid) {
        w = array[rt];
        stepHistory.push(rt);
        rt++;
      } else if (rt >= end) {
        w = array[lt];
        stepHistory.push(lt);
        lt++;
      } else if (array[lt] > array[rt]) {
        w = array[lt];
        stepHistory.push(lt);
        lt++;
      } else {
        w = array[rt];
        stepHistory.push(rt);
        rt++;
      }
      temp[i] = w;
    }
    for (var i = 0; i < end - start; i++) {
      insertValue(array, start + i, temp[i], true);
    }
  }
}

/**
 * increment the step of sorting
 */

function bang() {
  // start animation
  if (bangCount === 0) {
    playSequence = inputArray.slice();
  }
  // finish animation
  if (bangCount === stepHistory.length) {
    outlet(6, "bang");
    bangCount = 0;
    return;
  }
  // check the history data
  var operationOrAccess = stepHistory[bangCount];
  if (!isInteger(operationOrAccess)) {  // operation 
    switch (operationOrAccess[0]) {
      case 0:
        swap(playSequence, operationOrAccess[1], operationOrAccess[2], false);
        break;
      case 1:
        insert(playSequence, operationOrAccess[1], operationOrAccess[2], false);
        break;
      case 2:
        insertValue(
          playSequence,
          operationOrAccess[1],
          operationOrAccess[2],
          false
        );
        break;
      default:
        break;
    }
    operationOrAccess = operationOrAccess[1]; // Swap|Insert -> index
  }

  outlet(1, [
    playSequence[Math.max(0, operationOrAccess - 1)],
    playSequence[operationOrAccess],
    playSequence[Math.min(playSequence.length - 1, operationOrAccess + 1)],
  ]);

  outlet(0, playSequence);

  pointerSequence[operationOrAccess] = playSequence[operationOrAccess];
  outlet(2, pointerSequence);
  pointerSequence[operationOrAccess] = 0;

  bangCount++;
}

function dump() {
  outlet(2, stepHistory);
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

function init() {
  pointerSequence = Array();
  for (var i = 0; i < inputArray.length; i++) {
    pointerSequence.push(0);
  }
  stepHistory = Array();
  bangCount = 0;
}

function list() {
  inputArray = arrayfromargs(arguments);
  init();
  outlet(0, inputArray);
  outlet(2, pointerSequence);
}

function sort() {
  playSequence = inputArray.slice();
  outlet(4, "set Now Sorting...");
  post("Now sorting with", alg, "\n");

  // for re-run sorting
  init();
  outlet(0, inputArray);
  outlet(2, pointerSequence);

  if (inputArray.length === 0) {
    post("set the sequence list to sort in first inlet\n");
  }
  if (selectedAlgorithm === "bubble") {
    bubbleSort(playSequence);
  }
  if (selectedAlgorithm === "selection") {
    selection_sort(playSequence);
  }
  if (selectedAlgorithm === "quick") {
    quickSort(playSequence, 0, playSequence.length - 1);
  }
  if (selectedAlgorithm === "insertion") {
    insertionSort(playSequence);
  }
  if (selectedAlgorithm === "merge") {
    mergeSort(playSequence, 0, playSequence.length - 1);
  }
  post("Done! in ", stepHistory.length, " steps\n");
  outlet(4, "set");
}

function debugMode() {
  var flag = Number(arrayfromargs(arguments));
  if (flag === 0) {
    isDebug = false;
  } else {
    isDebug = true;
    debug_log("debug mode set");
  }
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
