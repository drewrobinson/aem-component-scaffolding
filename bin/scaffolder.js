#!/usr/bin/env node --experimental-modules --no-warnings
"use strict";

const shell           = require("shelljs");
const copy            = require("recursive-copy");
const path            = require("path");
const through         = require("through2");
const fs              = require("fs");
const util            = require("util");
const program         = require("commander");
const sling2jcr       = require("sling2jcr");
const chokidar        = require("chokidar");
const aux             = require("./aux.js");
const configuration   = require("./configuration").instance;
const COMPONENT_TYPES = require("./constants").COMPONENT_TYPES;
const PROJECT_PATH    = require("./constants").PROJECT_PATH;

const PATH = __dirname.split('/');
const PARENT_PATH = PATH.splice(0, PATH.length-1).join('/');

program
  .version("1.0.8")
  .option("--type [type]", "Required: Specify the type of component", /^(content|structure)$/i, "content")
  .option("--title [title]", "Required: Specify title of the new component")
  .option("--group [group]", "Specify the desired component group")
  .option("--superType [superType]", "Specify the slingResourceSuperType for the component")
  .option("--category [category]", "Specify the clientLib category for this component")
  .option("--sync [sync]", "Enable syncing with the AEM instance declared in the config file")
  .parse(process.argv);

/**
 * Singleton class representing the scaffolder
 */
class Scaffolder {

  constructor() {
    if (!!Scaffolder.instance) {
      return Scaffolder.instance;
    }

    Scaffolder.instance = this;
    this.config = null;
    
    return this;
  }


  /**
   * Helper method to log messages to terminal
   * @param msg
   *
   * @TODO - Ensure cross platform logging solution
   */
  logger(msg) {
    console.log(msg);
  }


  /**
   * Responsible for ensuring configuration is available and routing commands
   */
  async start(){
    let self = this;

    self.config = await configuration.read();

    if(!self.config || process.argv.includes("init")){
      self.config = await configuration.configure();
                    await configuration.write(self.config);
    }

    if(process.argv.includes("--type")){
      self.run() ;
    }
  }

  run() {
    let self      = this;
    let project   = self.config.project.replace(/\s+/g, '-').toLowerCase();
    let directory = self.config.directory;

    if(!self.config.project || !self.config.directory || !program.type || !program.title){
      throw new Error('Unable to create component. Did you include --type and --title flags?');
    }

    let type      = program.type;
    let title     = program.title;
    let name      = title.replace(/\s+/g, '-').toLowerCase();
    let group     = program.group         || '';
    let superType = program.superType     || '';
    let category  = program.category      || 'components';
    let templatePath;
    let destPath;

    switch(type.toLowerCase()){
      case COMPONENT_TYPES.CONTENT:
        templatePath = `${PARENT_PATH}/templates/content/`;
        destPath =  `${PROJECT_PATH}/ui.apps/src/main/content/jcr_root/apps/${directory}/components/content/`;
      break;
    }

    destPath = `${destPath}/${name}`;

    const copyConfig = {
      overwrite: true,
      expand: true,
      dot: true,
      junk: true,
      filter: [
        '**/*',
        '!.htpasswd'
      ],

      rename: function(filePath) {
        if(filePath === 'component.html'){
          filePath = filePath.replace(/component/g, name);
        }
        return filePath;
      },

      transform: function(src, dest, stats) {
        if (path.extname(src) !== '.xml') { return null; }
        return through(function(chunk, enc, done)  {
          var output = chunk.toString()
            .replace(/%sTitle/g, title)
            .replace(/%sProject/g, project)
            .replace(/%sComponentGroup/g, group)
            .replace(/%sResourceSuperType/g, superType)
            .replace(/%sCategory/g, category);
          done(null, output);
        });
      }
    };

    try{
      copy(templatePath, destPath, copyConfig)
        .on(copy.events.COPY_FILE_START, function(copyOperation) {
          //self.logger('Copying file ' + copyOperation.src + '...');
        })
        .on(copy.events.COPY_FILE_COMPLETE, function(copyOperation) {
          //self.logger('Copied to ' + copyOperation.dest);
        })
        .on(copy.events.ERROR, function(error, copyOperation) {
          console.error('Unable to copy ' + copyOperation.dest);
        })
        .then(function(results) {
          self.logger(`Done. ${results.length} file(s) copied`);
        })
        .catch(function(error) {
          return self.logger(`Copy failed: ${error}`);
        });

    }catch(e){
      console.log('error: ', e);
    }
  }

  help() {
    let self = this;
    self.logger('init, scaffold, help');
    self.logger('  required args: \n   --type     options:content \n   --title     i.e. my-component');
    self.logger('  optional args: \n   --slingResourceSuperType \n   --componentGroup \n   --category');
  }

}

const instance = new Scaffolder();
exports.instance = instance;