var assert = require('assert');
var aux    = require('../bin/aux.js');

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

            var pageList = [
                'test/content/component/content/a/.content.xml',
                'test/content/component/content/a/a.html',
                'test/content/component/content/b/.content.xml',
                'test/content/component/content/b/_cq_dialog.xml',
                'test/content/component/content/b/b.html',
                'test/content/component/structure/homepage/.content.xml',
                'test/content/component/structure/page/.content.xml'
            ];

            assert.equal(aux.crawl(__dirname + "/content").length, pageList.length);
        });
        it('Return a list of all the child files and directories under the specified directory with a trailing slash', function() {
            var pageList = [
                'test/content/component/content/a/.content.xml',
                'test/content/component/content/a/a.html',
                'test/content/component/content/b/.content.xml',
                'test/content/component/content/b/_cq_dialog.xml',
                'test/content/component/content/b/b.html',
                'test/content/component/structure/homepage/.content.xml',
                'test/content/component/structure/page/.content.xml'
            ];

            assert.equal(aux.crawl(__dirname + "/content/").length, pageList.length);
        });
    });

    describe('#sortByFileName()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1,2,3].indexOf(4));
        });
    });

    describe('#sortByFileDepth()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1,2,3].indexOf(4));
        });
    });
});