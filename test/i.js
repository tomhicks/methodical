'use strict';
var expect = require('chai').expect;
var sinon = require('sinon');

var I = require('../src/i');

describe('I', function () {
    it('should be available', function () {
        expect(I).to.be.instanceof(Function);
    });

    it('should create I instances', function () {
        /* jshint expr:true */
        expect(new I()).to.be.ok;
    });

    it('should have a function property with the correct value', function () {
        expect(I.function).to.equal('function');
    });

    describe('.getInterface', function () {
        it('should build a blank interface when nothing is passed', function () {
            var i = new I();

            expect(i.getInterface()).to.eql({
                required: {}
            });
        });

        describe('when an array is passed', function () {
            it('should build required methods', function () {
                var i = new I(['method1', 'method2']);
                expect(i.getInterface()).to.eql({
                    required: {
                        'method1': 'function',
                        'method2': 'function'
                    }
                });
            });

            it('should ignore non-strings', function () {
                var i = new I([{}, 'method1']);
                expect(i.getInterface()).to.eql({
                    required: {
                        'method1': 'function'
                    }
                });
            });

            it('should ignore empty strings', function () {
                var i = new I(['', 'method1']);
                expect(i.getInterface()).to.eql({
                    required: {
                        'method1': 'function'
                    }
                });
            });
        }); // 'when an array is passed'

        describe('when an object is passed', function () {
            it('should copy the required and optional properties', function () {
                var config = {
                    required: {
                        method1: 'function'
                    },
                    optional: {
                        method2: 'function'
                    }
                };

                var i = new I(config);

                expect(i.getInterface()).to.eql(config);
            });

            it('should take an array an turn it into required methods', function () {
                var config = {
                    required: ['method1', 'method2'],
                    optional: ['method3', 'method4']
                };

                var i = new I(config);

                expect(i.getInterface()).to.eql({
                    required: {
                        method1: 'function',
                        method2: 'function'
                    },
                    optional: {
                        method3: 'function',
                        method4: 'function'
                    }
                });
            });

            it('should assume functions', function () {
                var i = new I({
                    required: {
                        method1: 'function'
                    },
                    optional: {
                        method2: ''
                    }
                });

                expect(i.getInterface()).to.eql({
                    required: {
                        method1: 'function'
                    },
                    optional: {
                        method2: 'function'
                    }
                });
            });

        });

    });

    describe('.check', function () {
        describe('when checking an object required methods', function () {
            it('should pass for valid objects', function () {
                var i = new I(['method1']);

                function testInterface() {
                    i.check({
                        method1: function () {}
                    });
                }

                expect(testInterface).not.to.throw();

            });

            it('should throw for unconforming objects', function () {
                var i = new I(['method1']);

                function testInterface() {
                    i.check({
                        method2: function () {}
                    });
                }

                expect(testInterface).to.throw(TypeError);
                expect(testInterface).to.throw(/method1/);
            });

            it('should include the interface name in the error', function () {
                var i = new I(['method1']);
                i.name = 'My interface';

                function testInterface() {
                    i.check({});
                }

                expect(testInterface).to.throw(TypeError);
                expect(testInterface).to.throw(/My interface/);
            });

            it('should name all missing methods when passed some nonsense object to check', function () {
                var i = new I(['method1', 'method2']);

                function testInterface1() {
                    i.check(undefined);
                }
                expect(testInterface1).to.throw('method1');
                expect(testInterface1).to.throw('method2');

                function testInterface2() {
                    i.check(null);
                }
                expect(testInterface2).to.throw('method1');
                expect(testInterface2).to.throw('method2');

                function testInterface3() {
                    i.check(false);
                }
                expect(testInterface3).to.throw('method1');
                expect(testInterface3).to.throw('method2');

                function testInterface4() {
                    i.check([]);
                }
                expect(testInterface4).to.throw('method1');
                expect(testInterface4).to.throw('method2');

            });
        });
    });

    describe('.complete', function () {
        describe('when asking to complete an object', function () {
            it('should leave objects alone that already conform', function () {
                var i = new I(['method1']);

                var method1 = function () {};
                var method2 = function () {};
                var object = {
                    method1: method1,
                    method2: method2
                };

                i.complete(object);

                expect(object.method1).to.equal(method1);
                expect(object.method2).to.equal(method2);
            });

            it('should add methods to objects that are missing them', function () {
                var i = new I(['method1', 'method2']);

                var object = {};

                i.complete(object);

                function callAddedMethod() {
                    object.method1();
                }

                expect(object).to.respondTo('method1');
                expect(object).to.respondTo('method2');

                expect(callAddedMethod).not.to.throw();

            });
        });

        describe('when asking to complete a non-object', function () {
            it('should throw a type error for undefined', function () {
                var i = new I(['method1']);

                function completeGarbage() {
                    i.complete(undefined);
                }

                expect(completeGarbage).to.throw(TypeError);

            });

            it('should work normally for a function', function () {
                var i = new I(['method1']);
                var fn = function () {};

                function completeAFunction() {
                    i.complete(fn);
                }

                expect(completeAFunction).not.to.throw(TypeError);
                expect(typeof fn.method1).to.equal('function');
            });
        });
    });

    describe('.tryCall', function () {
        it('should execute the function if it exists', function () {
            var i = new I(['method1']);
            var object = {
                method1: sinon.spy()
            };
            i.tryCall(object, 'method1');

            expect(object.method1.called).to.be.true;
        });

        it('should throw an error if the passed method was required', function () {
            var i = new I(['method1']);

            function tryCall() {
                i.tryCall({}, 'method1');
            }

            expect(tryCall).to.throw();
        });

        it('should not throw an error if the method is optional and does not exist', function () {
            var i = new I({
                optional: ['method1']
            });

            function tryCall() {
                i.tryCall({}, 'method1');
            }

            expect(tryCall).not.to.throw();
        });

        it('should not throw an error if the method is not mentioned and does not exist', function () {
            var i = new I(['method1']);

            function tryCall() {
                i.tryCall({}, 'method2');
            }

            expect(tryCall).not.to.throw();
        });

        it('should pass the correct arguments to called methods', function () {
            var i = new I(['method1']);

            var object = {
                method1: sinon.spy()
            };

            i.tryCall(object, 'method1', 'arg1', 'arg2');

            expect(object.method1.withArgs('arg1', 'arg2').calledOnce).to.be.true;
        });
    });

    describe('.tryApply', function () {
        it('should pass arguments correctly', function () {
            var i = new I(['method1']);

            var object = {
                method1: sinon.spy()
            };

            i.tryApply(object, 'method1', ['arg1', 'arg2']);

            expect(object.method1.withArgs('arg1', 'arg2').calledOnce).to.be.true;
        });
    });

});