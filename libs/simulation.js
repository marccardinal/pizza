
var fs = require('fs');
var events = require('events');
var HashMap = require('hashmap');
var ProgressBar = require('progress');
var Table = require('cli-table');

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
Simulation.prototype.pretty = function() {
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
    grid[i] = new Array(width).fill(" ");
  }

  //Populate the 2d grid with values
  this.houses.forEach(function(value, key) {
    var coords = key.split(":");
    grid[coords[1]-minY][coords[0]-minX] = value;
  });

  //And finally print the table
  var table = new Table({
    style: { 'padding-left': 0, 'padding-right': 0, 'compact': true }
  });
  for (var y = 0; y < grid.length; y++) {
    table.push(grid[y]);
  }
  console.log(table.toString());
};

Simulation.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = Simulation;
