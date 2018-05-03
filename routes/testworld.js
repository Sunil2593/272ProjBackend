
var assert = require('assert');
var expect    = require("chai").expect;
var mocha = require('mocha');


exports.mochatest=function (req,res) {
    var describe = mocha.describe;
    var it = mocha.it;
    assert.equal([1,2,3].indexOf(4), -1);
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal([1,2,3].indexOf(4), -1);
            console.log("test passed");
        });
    });
};

