#! /usr/bin/env node

/**
 *  Scaffolder - AEM Component Scaffolding Utility
 *
 * @author Drew Robinson (hello@drewrobinson.com)
 * @version 1.0.8
 * @desc Module provides scaffolding for AEM content components.
 *
 */

const shell     = require("shelljs");
const copy      = require('recursive-copy');
const path      = require('path');
const through   = require('through2');
const fs        = require('fs');
const util      = require('util');
const prompt    = require('prompt');
const sling2jcr = require("sling2jcr");
const chokidar  = require('chokidar');
const program   = require('commander');
const aux       = require('../aux.js');

const CONFIG_FILE = '/aem-scaffolding-config.json';

//Set Prompt Props
prompt.message = 'Please enter the ';
prompt.delimiter = '';

//Set Env Args
const args = process.argv;

program
  .version('1.0.8')
  .option('-T, --type [type]', "Required: Specify the type of component", /^(content|page)$/i, 'content')
  .option('-n, --name [name]', "Required: Specify the name of the new component")
  .option('-t, --title [title]', "Specify the title of the new component; if not specified, the name will be used")
  .option('-g, --componentGroup [group]', "Specify the desired component group")
  .option('-s, --superType [superType]', "Specify the slingResourceSuperType for the component")
  .option('-c, --category [category]', "Specify the clientLib category for this component")
  .option('-S, --sync [sync]', "Enable syncing with the AEM instance declared in the config file")
  .parse(process.argv);

let __path = __dirname;
    __path = __path.split('/');
    __parent_path = __path.splice(0, __path.length-1);
    __parent_path = __parent_path.join('/');
    __project_path = process.cwd();

let __config = {};

let __slingLib = null;

/**
 * Component Types
 * @type {{CONTENT: string, STRUCTURE: string, NAVIGATION: string}}
 */
const cmpTypes = {
  CONTENT: 'content'
};

const Scaffolder = (function() {

  //Instance stores reference to the singleton instance
  let instance;

  // Singleton
  function initialize() {

    /**
     * Responsible for requesting user input for scaffolding configuration
     */
    async function requestConfig() {
      let _config = {};
      let _error = null;
      let config = new Promise(function(resolve, reject) {
        prompt.start();
        prompt.get([{
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
        }], function(err, result) {

          if (err) {
            _error = err;
          }
          _config = {
            "project": result.project || "undefined",
            "directory": result.directory || "undefined",
            "host": result.host || "localhost",
            "port": result.port || "4502",
            "username": result.username || "admin",
            "password": result.password || "admin"
          };

          for (var i in _config) {
            if (_config[i] === 'undefined') {
              _error = 'missing required configuration: ' + i;
              break;
            }
          }

          if (!_error) {
            resolve(_config);
          } else {
            reject(_error);
          }
          prompt.stop();
        });
      });

      return await config;
    }

    /**
     * Responsible for writing the config file to disk
     * @param config
     */
    function writeConfig(config) {
      fs.writeFileSync(__project_path + CONFIG_FILE, JSON.stringify(config, null, '\t'), 'utf-8');
      console.log('All set:  aem-component-scaffolding-config.json has been created at ' + __project_path + CONFIG_FILE);
    }

    /**
     * Responsible for reading the config file from disk
     * @returns {Promise}
     */
    async function readConfig() {
      let config = new Promise(function(resolve, reject) {
        fs.readFile(__project_path + CONFIG_FILE, "utf8", function(err, data) {
          if (!err) {
            resolve(data);
          } else {
            reject(err);
          }
        });
      });

      return config;
    }


    /**
     * Responsible for creating an instance of Sling2JCR
     * @param config
     */
    function setSlingLib(config){
      "use strict";
      __slingLib = new sling2jcr.Sling2JCR([{
        "host": "http://" +__config.host,
        "port": __config.port,
        "username": __config.username,
        "password": __config.password
      }]);
    }

    /**
     * crxImport
     * @param event
     * @desc Asynchronously process file import queue
     */
    function crxImport(event, path){
      var watcher = this;

      function sync(file) {
        if(!__slingLib){
          throw new Error('missing server config');
        }
        var f = file, promise = __slingLib.process(f);
        promise.then(function (val) {
          console.log('Importing content....  ' + f);
          if (filesToSync.length > 0) {
            processQueue();
          }else{
            console.log('import complete');
            watcher.close();
          }
        });
      }

      function processQueue() {
        var file = filesToSync.shift();
        if (file) {
          sync(file);
        }
      }

      if (!fs.existsSync(path)) {
        console.log('delete it: ' + event);
        //lib.process(filePath, true);
      } else {
        var segments = path.split('/'),
          file = segments.pop(),
          folder = segments.join('/')+'/',
          filesToSync = aux.crawl(folder);
        filesToSync = aux.sortByFileName(filesToSync);
        filesToSync = aux.sortByFileDepth(filesToSync);
        processQueue();
      }
    }

    /**
     * Responsible for preparing the component template files and copying them into the project
     * @param project
     * @param directory
     * @param type
     * @param title
     * @param group
     * @param superType
     * @param category
     * @param sync
     */
    function scaffoldComponent(project, directory, type, name, title, group, superType, category, sync) {
      if(!project || !directory || !type || !title){
        throw new Error('Cannot get component template without required args');
      }

      let projectName = project.replace(/\s+/g, '-').toLowerCase();
      let componentName = title.replace(/\s+/g, '-').toLowerCase();
      let componentTitle = title || componentName;
      let componentGroup = group || '';
      let resourceSuperType = superType || '';
      let componentCategory = category || 'components';
      let templatePath;
      let destPath;

      switch(type.toLowerCase()){
        case cmpTypes.CONTENT:
          templatePath = __parent_path + '/templates/content/';
          destPath =  `${__project_path}/ui.apps/src/main/content/jcr_root/apps/${directory}/components/content/`;
          break;
        default:;
      }

      destPath = destPath + '/' + componentName;

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
            filePath = filePath.replace(/component/g, componentName);
          }
          return filePath;
        },

        transform: function(src, dest, stats) {
          if (path.extname(src) !== '.xml') { return null; }
          return through(function(chunk, enc, done)  {
            var output = chunk.toString()
                              .replace(/%sTitle/g, componentTitle)
                              .replace(/%sProject/g, projectName)
                              .replace(/%sComponentGroup/g, componentGroup)
                              .replace(/%sResourceSuperType/g, resourceSuperType)
                              .replace(/%sCategory/g, componentCategory);
            done(null, output);
          });
        }
      };

      //Watch & Sync w/CRX if Sync Flag is true
      let watcher  = chokidar.watch(destPath, {persistent: true});

      if(sync){
        watcher.on('all', crxImport.bind(watcher));//bind to watcher to allow watcher to be closed from within crxImport
      }

      try{
        copy(templatePath, destPath, copyConfig)
          .on(copy.events.COPY_FILE_START, function(copyOperation) {
            console.info('Copying file ' + copyOperation.src + '...');
          })
          .on(copy.events.COPY_FILE_COMPLETE, function(copyOperation) {
            console.info('Copied to ' + copyOperation.dest);
          })
          .on(copy.events.ERROR, function(error, copyOperation) {
            console.error('Unable to copy ' + copyOperation.dest);
          })
          .then(function(results) {
            console.info(results.length + ' file(s) copied');

            //@TODO find better way to close watcher
            // setTimeout(function(){
            //   "use strict";
            //   watcher.close();
            // },2000)
          })
          .catch(function(error) {
            watcher.close();
            return console.error('Copy failed: ' + error);
          });

      }catch(e){
        console.log('error: ', e);
      }
    }

    /**
     * Responsible for handling the async process of generating a config file based on user input
     */
    function init() {
      console.log('To get started we will need your configuration details. To accept the default values simply hit enter to continue.');

      let configPromise = requestConfig();

      configPromise.then(function(config) {
        writeConfig(config);
      }).catch(function(reason) {
        console.log('Blasted.. Something has gone awry during the init', reason);
      });
    }

    /**
     * Responsible for scaffolding the component based on config details and cli args
     */
    function scaffold() {
      let configPromise = readConfig();

      let type = program.type ? program.type : null;
      let name = program.name ? program.name : null;
      let title = program.title ? program.title : null;
      let group = program.componentGroup ? program.componentGroup : null;
      let superType = program.superType ? program.superType : null;
      let category = program.category ? program.category : null;
      let sync = program.sync ? true : null;

      configPromise.then(function(val) {
        __config = JSON.parse(val);

        if(!__slingLib){
          setSlingLib(__config);
        }

        if (__config) {
          scaffoldComponent(__config.project, __config.directory, type, name, title, group, superType, category, sync);
        } else {
          console.log('Hmmm... looks like you haven\'t created a config file yet. Run: scaffold-component init');
        }
      }).catch(function(reason) {
        console.log('Blasted.. Something has gone awry', reason);
      })
    }

    /**
     * Responsible for logging the utility commands to the console
     */
    function help() {
      console.log('<command> is one of: init, help');
      console.log('  required args: \n   --type     options:content \n   --title     i.e. my-component');
      console.log('  optional args: \n   --slingResourceSuperType \n   --componentGroup \n   --category \n  --sync');
    }

    return {
      init: init,
      scaffold: scaffold,
      help: help
    }
  }

  return {
    // Get Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function() {
      if (!instance) {
        instance = initialize();
      }

      return instance;
    }
  };
})();

var aemScaffolder = Scaffolder.getInstance();

//Invoke Scaffolder Method Based on Args
if (args.includes('init')) {
  aemScaffolder.init();
} else if (program.type) {
  aemScaffolder.scaffold();
} else {
  aemScaffolder.help();
}
