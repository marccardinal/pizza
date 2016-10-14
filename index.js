#!/usr/bin/env node

'use strict';

var program = require('commander');

var Simulation = require('./libs/simulation.js');

program
  .usage('[options] <file>')
  .option('-w, --workers <n>', 'Number of delivery people')
  .option('-p, --pretty', 'Display a pretty version of the resulsts')
  .action(function(file) {
    console.log("Running with %s and %s workers", file, program.workers);

    // Prepare and run the simulation
    var simulation = new Simulation()
      .setWorkers(program.workers)
      .setFile(file)
      .run();

    // The simulation is over, let's print the output
    simulation.on('runDone', function() {
        if (program.pretty) {
            this.pretty();
        }

      console.log("%s houses were visited!", this.getHousesCount());
    });

  })
  .parse(process.argv);
