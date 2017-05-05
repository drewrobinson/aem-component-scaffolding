'use strict';

/**
 *  Automate UXE AEM Dev Process
 *
 * @author Drew Robinson (hello@drewrobinson.com)
 * @version 0.0.1
 * @desc Task runner to help improve front-end dev process within AEM. Scaffold components, tests, import changes to CRX.
 *
 */

var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var uglify      = require('gulp-uglify');
var aem         = require('aem-component-scaffolding');
var shell       = require('gulp-shell');
var sling2jcr   = require("sling2jcr");
var fs          = require("fs");
var path        = require('path');

/**
 * Config
 * @type {string}
 */
var project = 'cq-accelerator',
    absPath = __dirname,
    config = {
        project_name: 'cq-accelerator',
        servers: [{
            "host": "http://localhost",
            "port": 4502,
            "username": "admin",
            "password": "admin"
        }],
        paths: {
            jcr_root: `${absPath}/ui.apps/src/main/content/jcr_root`,
            components: {
                content: `${absPath}/ui.apps/src/main/content/jcr_root/apps/${project}/components/content/`,
                structure: `${absPath}/ui.apps/src/main/content/jcr_root/apps/${project}/components/structure/`
            }
        }
    },
    lib = new sling2jcr.Sling2JCR(config.servers);

/**
 * Aux Methods
 * @type {{debounce: aux.debounce, flatten: aux.flatten, crawl: aux.crawl, sort: aux.sort, prioritize: aux.prioritize}}
 */
var aux = {

    /**
     * Debounce
     * @param func
     * @param wait
     * @param immediate
     * @returns {Function}
     * @desc Limits func to being called n number of times per wait
     */
    debounce: function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },

    /**
     * Flatten
     * @param arr
     * @returns {*}
     * @desc Reduces multi-dimensional array to heterogeneous array
     */
    flatten: function(arr){
        return arr.reduce(function(acc, val){
            if(Array.isArray(val)){
                return acc.concat(aux.flatten(val));
            }else{
                return acc.concat(val);
            }
        },[]);
    },

    /**
     * Crawl
     * @param dir
     * @returns {*}
     * @desc Recursive traverse directory to build heterogeneous list of children
     */
    crawl: function(dir){
        return aux.flatten(fs.readdirSync(dir).map(function(childNode){
            if(fs.statSync(dir+childNode).isFile()){
                return dir + childNode;
            }else if(fs.statSync(dir+childNode+'/').isDirectory()){
                return aux.crawl(dir+childNode+'/');
            }
        }));
    },

    /**
     * sortByFileName
     * @param list
     * @returns {*|Array.<T>}
     * @desc Sorts files by dot name(e.g. .content.xml)
     */
    sortByFileName: function(list){
        return list.sort(function(a, b){
            var a = a.split('/'), b = b.split('/');

            if(a[a.length-1][0] === b[b.length-1][0]){
                return 0;
            }else if(a[a.length-1][0] === '.'){
                return -1;
            }else if(b[b.length-1][0] === '.'){
                return 1;
            }else{
                return a[a.length-1].localeCompare(b[b.length-1]);
            }
        });
    },

    /**
     * sortByFileDepth
     * @param list
     * @returns {*}
     * @desc !important: assumes list has been sorted by dot name; Then further sorts based on min depth.
     *       Use case: .content.xml files must be first to be imported at each level as they represent directories.
     */
    sortByFileDepth: function(list){
        return list.sort(function(a,b){
            return (a.match(/\//g) || []).length - (b.match(/\//g) || []).length;
        });
    }
};


/**
 * Create Component Task
 * @des Scaffold a new component with aem-component-util module
 *
 * CL: gulp create-component --type content --name my-component
 */
gulp.task('create-component', function() {
    try{
        var opts = {}, i;
        opts.project = config.project_name;
        i = process.argv.length - 1;

        while(i > -1) {
            if (process.argv[i] === '--type') {
                opts.type = process.argv[i + 1].toLowerCase();
                opts.dest = config.paths.components[opts.type];
            }
            if (process.argv[i] === '--name') {
                opts.name = process.argv[i + 1];
            }
            i--;
        }
        aem.util.scaffoldComponent(opts);
    }catch(e){
        console.log(e);
    }
});

/**
 * crxImport
 * @param event
 * @desc Asynchronously process file import queue
 */
function crxImport(event){

    function sync(file) {
        var f = file, promise = lib.process(f);
        promise.then(function (val) {
            console.log('Importing content....  ' + f);
            if (filesToSync.length > 0) {
                processQueue();
            }
        });
    }

    function processQueue() {
        var file = filesToSync.shift();
        if (file) {
            sync(file);
        }
    }

    if (!fs.existsSync(event.path)) {
        console.log('delete it: ' + event);
        //lib.process(filePath, true);
    } else {
        var segments = event.path.split('/'),
            file = segments.pop(),
            folder = segments.join('/')+'/',
            filesToSync = aux.crawl(folder);
            filesToSync = aux.sortByFileName(filesToSync);
            filesToSync = aux.sortByFileDepth(filesToSync);
        processQueue();
    }
}


/**
 * Watch Task
 * @desc Listens for file system changes on jcr_root
 * @TODO: run tests, live refresh
 */
gulp.task('watch', function(){
    gulp.watch(config.paths.jcr_root+'/**', aux.debounce(function(event){
        crxImport(event);
    }, 500, false));
});