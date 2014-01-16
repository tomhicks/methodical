'use strict';
var expect = require('chai').expect;

var Intercol = require('../src/intercol');

describe('Intercol', function() {
  it('should be available', function() {
    expect(Intercol).to.be.instanceof(Function);
  });

  it('should create Intercol instances', function () {
    /* jshint expr:true */
    expect(new Intercol()).to.be.ok;
  });

  describe('.getInterface', function () {
    it('should build a blank interface when nothing is passed', function () {
      var i = new Intercol();

      expect(i.getInterface()).to.eql({
        required: {}
      });
    });

    describe('when an array is passed', function () {
      it('should build required methods', function () {
        var i = new Intercol(['method1', 'method2']);
        expect(i.getInterface()).to.eql({
          required: {
            'method1': 'function',
            'method2': 'function'
          }
        });
      });

      it('should ignore non-strings', function () {
        var i = new Intercol([{}, 'method1']);
        expect(i.getInterface()).to.eql({
          required: {
            'method1': 'function'
          }
        });
      });

      it('should ignore empty strings', function () {
        var i = new Intercol(['', 'method1']);
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

        var i = new Intercol(config);

        expect(i.getInterface()).to.eql(config);
      });

      it('should assume functions', function () {
        var i = new Intercol({
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
    
  });

  describe('.complete', function () {

  });

});