const assert      = require('assert');
const aux         = require('../bin/aux.js');
const CONTENT_DIR = __dirname + "/content";

describe('Aux', function() {
    describe('#flatten()', function() {
        it('Flatten three arrays into one', function() {
            var a = [1, 2, 3];
            var b = ["one", "two", "three"];
            var c = [true, false];
            var d = [a, b, c];
            var result = aux.flatten(d);
            var test = [1, 2, 3, "one", "two", "three", true, false];

            assert.deepEqual(test, result);
        });
    });

    describe('#crawl()', function() {
        it('Return a list of all the child files and directories under the specified directory without a trailing slash', function() {

            let expected = [
                'component/content/.content.xml',
                'component/content/a/.content.xml',
                'component/content/a/a.html',
                'component/content/b/.content.xml',
                'component/content/b/_cq_dialog.xml',
                'component/content/b/b.html',
                'component/structure/.content.xml',
                'component/structure/homepage/.content.xml',
                'component/structure/page/.content.xml'
            ];

            assert.deepEqual(expected, reduceTestDirPaths(aux.crawl(CONTENT_DIR)));
        });
        it('Return a list of all the child files and directories under the specified directory with a trailing slash', function() {
            let expected = [
                'component/content/.content.xml',
                'component/content/a/.content.xml',
                'component/content/a/a.html',
                'component/content/b/.content.xml',
                'component/content/b/_cq_dialog.xml',
                'component/content/b/b.html',
                'component/structure/.content.xml',
                'component/structure/homepage/.content.xml',
                'component/structure/page/.content.xml'
            ];

            assert.deepEqual(expected, reduceTestDirPaths(aux.crawl(CONTENT_DIR + "/")));
        });
    });

    describe('#sortByFileName()', function() {
        it('Should return a sorted list based on end file names, regardless of directory structure', function() {

            let expected = [
                'component/content/.content.xml',
                'component/content/a/.content.xml',
                'component/content/b/.content.xml',
                'component/structure/.content.xml',
                'component/structure/homepage/.content.xml',
                'component/structure/page/.content.xml',
                'component/content/b/_cq_dialog.xml',
                'component/content/a/a.html',
                'component/content/b/b.html'
            ];

            let result = aux.sortByFileName(aux.crawl(CONTENT_DIR));
            var fileNames = reduceTestDirPaths(result);
            assert.deepEqual(expected, fileNames);
        });
    });

    describe('#sortByFileDepth()', function() {
        it('Should return a sorted list based on file depth', function() {
            var expected = [
                'component/content/.content.xml',
                'component/structure/.content.xml',
                'component/content/a/.content.xml',
                'component/content/b/.content.xml',
                'component/structure/homepage/.content.xml',
                'component/structure/page/.content.xml',
                'component/content/b/_cq_dialog.xml',
                'component/content/a/a.html',
                'component/content/b/b.html'
            ];
            var result = aux.sortByFileDepth(aux.sortByFileName(aux.crawl(CONTENT_DIR)));
            var fileNames = reduceTestDirPaths(result);
            assert.deepEqual(expected, fileNames);
        });
    });
});

/**
 * Utility function to effectively remove user-specific
 * directory structures considerations from the tests.
 * @param array the result of running a file traversal or sort operation
 * @returns an {Array} that starts from the 'component' folder in the test content directory
 */
function reduceTestDirPaths(array) {
    let fileNames = [];
    for (var i = 0; i < array.length; i++) {
        fileNames[i] = array[i].substr(array[i].lastIndexOf("component/"), array[i].length);
    }
    return fileNames;
}