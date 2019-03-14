#!/usr/bin/env node --experimental-modules --no-warnings
"use strict";

const PROJECT_PATH  = process.cwd();

const CONFIGURATION_STEPS = [{
  name: 'project',
  message: 'name of the project : (i.e. WeRetail)'
},{
  name: 'directory',
  message: 'name of the project directory: (i.e. weretail)'
}, {
  name: 'host',
  message: 'host: (localhost)'
}, {
  name: 'port',
  message: 'port: (4502)'
}, {
  name: 'username',
  message: 'AEM Username: (admin)'
}, {
  name: 'password',
  message: 'AEM Password: (admin)'
}];


const FILE_NAME = 'scaffolder-config.json';

const COMPONENT_TYPES = {
  CONTENT: 'content',
  STRUCTURE: 'structure'
};

module.exports =  {
  CONFIGURATION_STEPS: CONFIGURATION_STEPS,
  FILE_NAME: FILE_NAME,
  COMPONENT_TYPES: COMPONENT_TYPES,
  PROJECT_PATH: PROJECT_PATH
};
