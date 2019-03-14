#!/usr/bin/env node --experimental-modules --no-warnings
"use strict";
const fs            = require("fs");
const prompt        = require("prompt");
const STEPS         = require("./constants").CONFIGURATION_STEPS;
const FILE_NAME     = require("./constants").FILE_NAME;
const PROJECT_PATH     = require("./constants").PROJECT_PATH;

/**
 * Singleton class representing the configuration
 */
class Configuration {

  constructor(){
    if (!!Configuration.instance) {
      return Configuration.instance;
    }

    Configuration.instance = this;
    return this;
  }
  
  /**
   * Helper method to log messages to terminal
   * @param msg
   * @TODO - Ensure cross platform logging solution
   */
  logger(msg) {
    console.log(msg);
  }
  
  /**
   * Responsible for managing configuration creation
   */
  configure(){
    return this.wizard();
  }

  /**
   * Responsible for writing configuration file to disk
   * @param config
   */
  async write(config){
    let self = this;

    let result = new Promise(function(resolve, reject) {
      fs.writeFile(`${PROJECT_PATH}/${FILE_NAME}`, JSON.stringify(config, null, "\t"), function(err) {
        if(!err) {
          self.logger(`\n\nAll set: ${FILE_NAME} has been created: \n ${FILE_NAME}`);
          resolve('success');
        }else{
          self.logger(`\n\nUnable to write config file`);
          reject(err);
        }
      });
    });
    
    return await result;
  }

  /**
   * Responsible for reading configuration file disk
   * @returns {Promise|Promise<T>}
   */
  async read(){
    let self = this;
    let config = new Promise(function(resolve, reject) {
      fs.readFile(`${PROJECT_PATH}/${FILE_NAME}`, "utf8", function(err, data) {
        if (!err) {
          resolve(JSON.parse(data));
        } else {
          reject(err);
        }
      });
    }).catch(function(err){
      return null;
    });

    return await config;
  }

  /**
   * Responsible for prompting user for configuration
   * @returns {Promise|Promise<T>}
   */
  async wizard(){
    let self = this;
    self.logger("This wizard will walk you through creating a new config file. Let\'s get started:");
    let result = new Promise((resolve, reject) => {
      
      prompt.start();

      prompt.get(STEPS, function(err, result) {
        let error = err || null;
        let config = {
          "project":    result.project    || "undefined",
          "directory":  result.directory  || "undefined",
          "host":       result.host       || "localhost",
          "port":       result.port       || "4502",
          "username":   result.username   || "admin",
          "password":   result.password   || "admin"
        };

        for (var i in config) {
          if (config[i] === "undefined") {
            error = `missing required configuration:\n ${i}`;
            break;
          }
        }

        if (!error) {
          resolve(config);
        } else {
          reject(error);
        }

        prompt.stop();

      });
    });

    return await result;
  }

}

const instance = new Configuration();
Object.freeze(instance);
exports.instance = instance;