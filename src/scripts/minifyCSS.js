#!/usr/bin/env node

var compressor = require('node-minify');

compressor.minify({
  compressor: 'csso',
  input: 'dist/css/main.css',
  output: 'dist/css/main.css',
  options: {
    restructureOff: true // turns structure minimization off
  },
  callback: function(err, min) {}
});
