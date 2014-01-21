Methodical
=====
[![Build Status](https://travis-ci.org/tomhicks/methodical.png?branch=master)](https://travis-ci.org/tomhicks/methodical) [![Coverage Status](https://coveralls.io/repos/tomhicks/methodical/badge.png?branch=master)](https://coveralls.io/r/tomhicks/methodical?branch=master)

JavaScript library that provides support for enforcing objects to implement given interfaces.

## Motivation

JavaScript does not support <a href="http://en.wikipedia.org/wiki/Interface_(computing)">interfaces</a> natively. Often though, we do want to be able to determine that an object (usually one passed as a parameter to a function) has some given methods on it, and also conditionally call a method on an object if it has the method available.

To do this, we end up with lots of boilerplate code, such as:

```javascript
function foo(bar) {
    if (typeof bar.someMethod !== 'function' ||
            typeof bar.anotherMethod !== 'function') {
        throw new TypeError('bar must implement the someMethod and anotherMethod methods.');
    }
}
```

and

```javascript
function foo(bar) {
    if (typeof bar.someMethod === 'function') {
        bar.someMethod();
    }

    if (typeof bar.anotherMethod === 'function') {
        bar.anotherMethod();
    }
}
```

Finally, as JavaScript developers we're now plugging together more and more 3rd party modules, and knowing how to use the APIs exposed to us becomes more important. Currently, we have to read documentation (maybe above the function, maybe at the top of the file in an ```@description``` docblock, maybe on the web), read the first few lines of a method if the expectations are helpfully asserted up front (like the first example above), or sometimes just dig through the errors that our console throws up as we hit points in the code that expect an object to have a particular shape.

This is pretty much what interfaces in other programming languages are for. Although we can't make interfaces enforceable through static analysis like in other languages, we can do a lot better than what we currently have.

## The solution

Methodical gives us an implementation of interfaces in JavaScript. It lets us:

1. declare our interfaces in a standardised way, in their own file, and with their own documentation.
2. check an object to ensure it conforms to an interface, throwing descriptive and consistent errors if not.
3. conditionally call methods on an object without code bloat.
4. modify an object so that it does conform to an interface, so we can knowingly just call methods on it, again saving code bloat.

## The API

### Creating an interface

```javascript
var I = require('methodical');
var myInterface = new I({
    required: {
        requiredMethod1: I.function,
        requiredMethod2: I.function
    },
    optional: {
        optionalMethod1: I.function,
        optionalMethod2: I.function
    }
});

var interfaceWithOnlyRequiredMethods = new I(['requiredMethod1', 'requiredMethod2']);
```

### Using an interface

```javascript    
function mustPassProperObject(object) {
    myInterface.check(object);

    // if we got here, we can call these methods safely
    object.requiredMethod1();
    object.requiredMethod2();
}

// throws a TypeError, mentioning the missing methods.
mustPassProperObject({});

function callOptionalMethods(object) {
    // makes optional methods available
    myInterface.complete(object);

    // object will have these methods added
    myInterface.optionalMethod1();
    myInterface.optionalMethod2();
}

// will not throw a TypeError, as optional methods are added to the object
callOptionalMethods({});

function checkBeforeCalling(object) {
    myInterface.tryCall(object, 'optionalMethod1', arg1, arg2);
    myInterface.tryApply(object, 'optionalMethod2', [arg1, arg2]);

    // this will throw an error, as tryCall does not guard against required method calls
    myInterface.tryCall(object, 'requiredMethod1');
}

// will throw a TypeError because requiredMethod1 does not exist
checkBeforeCalling({});
```

### Notes

### Name

Originally this project was named i.js, so you will see i and I used around the place. I is used as a shorthand for Interface, so that'll probably stay in the examples.

#### Optional methods

On the face of it, there's not a lot of point in delcaring optional methods in an interface. However, what they do provide is documentation, effectively stating "here is some functionality you can use if you want, but you don't have to." These are extensively used in Apple's Objective-C libraries, most often for delegate callback methods, and probably in other libraries, too.

#### The use of I.function in interface declarations

This is primarily there because at some point in the future we might want to assert other property types, such as Number, Boolean, and even deeply-nested object structures.

## Future work

I would like to add more features, not necessarily in this order, to Methodical. I would like to be able to:

- declare that an object must have a primitive as a property (e.g. Number or String)
- declare that an object must have an object that implements another interface as a property (nested interfaces)
- declare an interface that extends another interface
- declare an interface based off an existing object
- allow objects to be restored to their original state after having been ```complete```d
- expose ```tryCall``` and ```tryApply``` as methods on the I object, so that I can guard against method calls even without using an interface
- support AMD and ```window``` global variable so that I can use Methodical in other environments

## License

Methodical is released under the [MIT License](http://www.opensource.org/licenses/MIT).