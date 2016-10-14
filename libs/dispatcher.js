
var Worker = require('./workers.js');

function Dispatcher() {
  this.workers = [];
  this.workerIdx = 0;
  this.houses = null;
};

//Set the hashmap used for persistence between moves
Dispatcher.prototype.setHouses = function(houses) {
  this.houses = houses;
  return this;
};

//Modify the number of workers
Dispatcher.prototype.setWorkers = function(workersCount) {
  for (var i = 0; i < workersCount; i++) {
    this.workers.push(new Worker(0,0));
    this.incrHouse([0,0]);
  }
  return this;
};

//Dispatch moves to workers
Dispatcher.prototype.dispatch = function(move) {
  for (var m of move) {
    coords = this.workers[this.workerIdx].move(String.fromCharCode(m)).coords();
    this.incrHouse(coords);
    this.workerIdx = ++this.workerIdx % this.workers.length;
  }
  return this;
};

//Increment the number of times we delivered at one set of coordinates
Dispatcher.prototype.incrHouse = function(coords) {
  key = coords[0] + ":" + coords[1];

  if (!this.houses.has(key)) {
    this.houses.set(key, 1);
  } else {
    this.houses.set(key, this.houses.get(key) + 1);
  }
}

module.exports = Dispatcher;
