#!/usr/bin/env node

'use strict';

var program = require('commander');

var Simulation = require('./libs/simulation.js');


// Related to https://github.com/tj/commander.js/issues/201
function argInt(string, defaultValue) {
  var int = parseInt(string, 10);

  if (typeof int == 'number') {
    return int;
  } else {
    return defaultValue;
  }
} 


program
  .usage('[options] <file>')
  .option('-w, --workers <n>', 'Number of delivery people', argInt, 1)
  .option('-p, --ascii', 'Display an ascii version of the results')
  .option('-o, --png <file>', 'Generate a png map of the houses')
  .action(function(file) {
    console.log("Running with %s and %s workers", file, program.workers);

    // Prepare and run the simulation
    var simulation = new Simulation()
      .setWorkers(program.workers)
      .setFile(file)
      .run();

    // The simulation is over, let's print the output
    simulation.on('runDone', function() {
        if (program.ascii) {
            this.ascii();
        }
        if (program.png) {
            this.png(program.png);
        }

      console.log("%s houses were visited!", this.getHousesCount());
    });

  })
  .parse(process.argv);
