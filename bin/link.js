#!/usr/bin/env node --experimental-modules --no-warnings
"use strict";

const shell           = require("shelljs");

if (shell.exec('npm link').code !== 0) {
  shell.echo('Scaffolder linked...');
  shell.exit(1);
}