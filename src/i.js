'use strict';

var _ = require('underscore');

function noOp() {}

function addFunctionNameToObject(functionName, object) {
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

function buildInterface(interfaceDescription) {
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

var Methodical = function (interfaceDescription) {
    this._interface = buildInterface(interfaceDescription);
};

Methodical.function = 'function';

Methodical.fromConstructor = function (Constructor) {
    var requiredMethods;

    if (_.isFunction(Constructor)) {
        requiredMethods = [];
        _.each(Constructor.prototype, function (value, key) {
            if (_.isFunction(value)) {
                requiredMethods.push(key);
            }
        });
    } else {
        throw new TypeError('A function must be passed');
    }

    return new Methodical(requiredMethods);
};

Methodical.prototype.getInterface = function () {
    return this._interface;
};

Methodical.prototype.check = function (object) {
    var errors = [];

    // ensures that if we pass garbage in, we get sensible error messages
    if (!_.isObject(object)) {
        object = {};
    }

    _.each(this.getInterface().required, _.bind(function (value, key) {
        if (typeof object[key] !== value) {
            errors.push('The required method "' + key + '" is not implemented');
        }
    }, this));

    if (errors.length) {
        var throwable = new TypeError();
        var messageIntro = 'The object does not conform to the interface: ';
        if (this.name) {
            messageIntro = 'The object does not conform to the "' + this.name + '" interface: ';
        }
        throwable.message = messageIntro + errors.join('; ');
        throw throwable;
    }

};

Methodical.prototype.complete = function (object) {

    if (!_.isFunction(object) && !_.isObject(object)) {
        throw new TypeError('Cannot complete a non-object');
    }

    _.each(this.getInterface().required, _.bind(function (value, key) {
        if (typeof object[key] !== value) {
            object[key] = noOp;
        }
    }, this));
};

Methodical.prototype.tryCall = function (object, method) {
    var methodArguments = Array.prototype.slice.call(arguments, 2);
    this.tryApply(object, method, methodArguments);
};

Methodical.prototype.tryApply = function (object, method, args) {
    if (_.isFunction(object[method])) {
        object[method].apply(object, args);
    } else if (this.getInterface().required[method] === 'function') {
        object[method].apply(object, args);
    }
};

module.exports = Methodical;