#!./node_modules/mocha/bin/mocha

'use strict';

var chai = require('chai');
var expect = chai.expect;

var Simulation = require('../libs/simulation.js');

describe('Simulation Tests', function() {

  it('getHousesCount() should return two given the pattern > and one worker', function(done) {
    var simulation = new Simulation()
      .setWorkers(1)
      .setFile("examples/ex1.txt")
      .run();
    simulation.on('runDone', function() {
      expect(this.getHousesCount()).to.equal(2);
      done();
    });
  });

  it('getHousesCount() should return four given the pattern ^>v< and one worker', function(done) {
    var simulation = new Simulation()
      .setWorkers(1)
      .setFile("examples/ex2.txt")
      .run();
    simulation.on('runDone', function() {
      expect(this.getHousesCount()).to.equal(4);
      done();
    });
  });

  it('getHousesCount() should return two given the pattern ^v^v^v^v^v and one worker', function(done) {
    var simulation = new Simulation()
      .setWorkers(1)
      .setFile("examples/ex3.txt")
      .run();
    simulation.on('runDone', function() {
      expect(this.getHousesCount()).to.equal(2);
      done();
    });
  });

});
