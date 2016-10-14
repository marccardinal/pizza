
function Worker(x, y) {
  this.x = x;
  this.y = y;
};

//Perform a move, changing the X and Y coordinates
Worker.prototype.move = function(move) {
  switch (move) {
    case '<':
      this.x--;
      break;
    case '>':
      this.x++;
      break;
    case 'v':
      this.y--;
      break;
    case '^':
      this.y++;
      break;
  }
  return this;
};

//The current coordinates
Worker.prototype.coords = function() {
  return [this.x, this.y];
};

module.exports = Worker;
