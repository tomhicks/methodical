'use strict';

var _ = require('underscore');

function addFunctionNameToObject (functionName, object) {
    if (functionName && _.isString(functionName)) {
        object[functionName] = 'function';
    }
}

function processBlock(block, blockName, outObject) {
    if (_.isArray(block[blockName])) {
        outObject[blockName] = outObject[blockName] || {};
        _.each(block[blockName], function (value) {
            addFunctionNameToObject(value, outObject[blockName]);
        });
    } else if (_.isObject(block[blockName])) {
        outObject[blockName] = outObject[blockName] || {};
        _.each(block[blockName], function (value, key) {
            addFunctionNameToObject(key, outObject[blockName]);
        });
    }
}

function buildInterface (interfaceDescription) {
    var result = {
        required: {}
    };

    if (_.isArray(interfaceDescription)) {
        _.each(interfaceDescription, function (methodName) {
            addFunctionNameToObject(methodName, result.required);
        });
    } else if (_.isObject(interfaceDescription)) {
        processBlock(interfaceDescription, 'required', result);
        processBlock(interfaceDescription, 'optional', result);
    }

    return result;
}

var Intercol = function (interfaceDescription) {
    this._interface = buildInterface(interfaceDescription);
};

Intercol.prototype.getInterface = function() {
    return this._interface;
};

module.exports = Intercol;