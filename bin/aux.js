var fs = require('fs');

/**
 * Aux Methods
 * @type {{debounce: aux.debounce, flatten: aux.flatten, crawl: aux.crawl, sort: aux.sort, prioritize: aux.prioritize}}
 */
const aux = {

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

        if (!(dir.charAt(dir.length - 1) === "/")) {
            dir += "/";
        }

        return aux.flatten(fs.readdirSync(dir).map(function(childNode){
            if(fs.statSync(dir + childNode).isFile()){
                return dir + childNode;
            }else if(fs.statSync(dir + childNode + '/').isDirectory()){
                return aux.crawl(dir + childNode + '/');
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

module.exports = aux;