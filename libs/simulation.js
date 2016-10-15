
var fs = require('fs');
var events = require('events');
var HashMap = require('hashmap');
var ProgressBar = require('progress');
var Table = require('cli-table');
var PNG = require('pngjs').PNG;

var Dispatcher = require('./dispatcher.js');


function Simulation() {
  events.EventEmitter.call(this);
  this.file = "";
  this.houses = new HashMap();
  this.dispatcher = new Dispatcher()
    .setHouses(this.houses);
}

//Get the number of unique houses visited
Simulation.prototype.getHousesCount = function() {
  return this.houses.count();
};

//Set the number of workers
Simulation.prototype.setWorkers = function(workersCount) {
  this.dispatcher.setWorkers(workersCount);
  return this;
};

//Set the file from which we will be reading moves from
Simulation.prototype.setFile = function(file) {
  this.file = file;
  return this;
};

//Run the simulation
Simulation.prototype.run = function() {
  var fileSize = fs.statSync(this.file).size;
  var fileStream = fs.createReadStream(this.file);
  var bar = new ProgressBar(' running [:bar] :percent :etas', {
    width: 20,
    total: fileSize,
    clear: false
  });

  //Reading the file
  fileStream.on('readable', function() {
    var move;
    var isValidMove = /[<^>v]+/;

    //One move at a time
    while (null !== (move = fileStream.read(1))) {
      bar.tick(move.length);

      if (isValidMove.test(move)) {
        this.dispatcher.dispatch(move);
      }
    }
  }.bind(this));

  //Reached the end of the file
  fileStream.on('end', function() {
    this.emit("runDone");
  }.bind(this));

  return this;
};

//Display the house map
Simulation.prototype.ascii = function() {

  var houses = this.housesMatrix();

  //Print a horizontally mirrored table (0,0) in bottom left
  var table = new Table({
    style: { 'padding-left': 0, 'padding-right': 0, 'compact': true }
  });
  for (var y = houses.height-1; y >= 0; y--) {
    table.push(this.zerosAsSpaces(houses.grid[y]));
  }
  console.log(table.toString());
};

//Generate a png representation of the house map
Simulation.prototype.png = function(file) {

  var houses = this.housesMatrix();

  //Create a new (empty) png
  var png = new PNG({
    width: houses.width,
    height: houses.height
  });

  //Populate the png with shades of red pixels everywhere we went
  //and leave the rest fully transparent
  //Here too we do a horizontal mirror so that the drawing orientation
  //matches what we naturally expect
  for (var y = 0; y < houses.height; y++) {
    for (var x = 0; x < houses.width; x++) {
      var idx = (houses.width * (houses.height - y - 1) + x) << 2;
      var intensity = parseInt(this.percentRank(houses.values, houses.grid[y][x]) * 255, 'weak');

      png.data[idx + 0] = intensity;
      png.data[idx + 1] = 0;
      png.data[idx + 2] = 0;
      png.data[idx + 3] = (houses.grid[y][x] > 0)
        ? 255
        : 0;
    }
  }

  //Write it to disk
  png.pack().pipe(fs.createWriteStream(file));
  return this;
};

//Squash the house hashmap into a 2d grid and compute some useful metadata
Simulation.prototype.housesMatrix = function() {
  var minX = null;
  var maxX = null;
  var minY = null;
  var maxY = null;
  var maxVal = null;

  //Find the bounds of the grid and the max value
  this.houses.forEach(function(value, key) {
    var coords = key.split(":");
    minX = Math.min(coords[0], minX);
    maxX = Math.max(coords[0], maxX);
    minY = Math.min(coords[1], minY);
    maxY = Math.max(coords[1], maxY);
    maxVal = Math.max(value, maxVal);
  });

  var width = (maxX - minX) + 1;
  var height = (maxY - minY) + 1;

  //Initialize a 2d grid
  var grid = new Array(height);
  for (var i = 0; i < grid.length; i++) {
    grid[i] = new Array(width).fill(0);
  }

  //Populate the 2d grid with values
  this.houses.forEach(function(value, key) {
    var coords = key.split(":");
    grid[coords[1]-minY][coords[0]-minX] = value;
  });

  return {
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY,
    maxVal: maxVal,
    width: width,
    height: height,
    grid: grid,
    values: this.houses.values()
  };
};

//The percentile rank of a value relative to an array of values.
//A percentile of, for example, 80 percent means that 80 percent of the
//  values in values are below the given score. 
//
//Values for kind:
//  "weak": This kind corresponds to the definition of a cumulative
//          distribution function.  A percentileofscore of 80%
//          means that 80% of values are less than or equal
//          to the provided score.
//  "strict": Similar to "weak", except that only values that are
//            strictly less than the given score are counted.
//  "mean": The average of the "weak" and "strict" scores, often used in
//          testing.
Simulation.prototype.percentRank = function(values, value, kind) {
  if (typeof kind === 'undefined')
    kind = 'weak';

  switch (kind) {
    case 'strict':
      return (values.filter(function(v) { return v < value }).length / values.length);
    case 'weak':
      return (values.filter(function(v) { return v <= value }).length / values.length);
    case 'mean':
      return ((values.filter(function(v) { return v < value }).length
        + values.filter(function(v) { return v <= value }).length)
        * 50.0 / values.length);
    default:
      throw new TypeError('kind must be one of strict, weak, mean');
  }
};

//Replace zero values in an array with spaces
Simulation.prototype.zerosAsSpaces = function(values) {
  return values.map(function(v) { return v !== 0 ? v : " "});
};

Simulation.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = Simulation;
