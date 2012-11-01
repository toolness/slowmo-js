SlomoJS is an attempt to make learning JavaScript and computational thinking easier by making the execution of JS code more transparent.

Traditionally, this is accomplished by peppering code with `console.log` statements and/or using a debugger. However, the former approach requires lots of extra code, and the latter approach presents novice users with a complex modal user interface.

With libraries like [esprima][] and [falafel][], however, we can monitor the execution of JS to do things in-browser that only debuggers are traditionally capable of. This allows us to potentially create innovative new solutions provide significant insight to the execution of running code without the hassles associated with traditional approaches--and without the need for users to install custom software.

## Design Notes

I originally wanted to use [Popcorn][] to generate a movie of the user's code being executed, but given [Edward Tufte][]'s belief that it's usually better to have information adjacent in space rather than stacked in time--which is yet another problem with traditional debuggers--I decided to make the visualization purely spatial, rather than temporal.

## Implementation Notes

Infinite loops are prevented by mangling the user's code to check running time at the beginning of each iteration of a loop, and throwing an exception if it's taking too long.

Lots of things can still be made more transparent. Getting/setting the attributes of objects, for instance.

The mangling being done by the code disables some JS semantics. All variables must be formally declared in a `var` statement, for instance, and function declarations are automatically converted to `var` statements with function expression initializers. [Hoisting][] is also broken.

  [esprima]: http://esprima.org/
  [falafel]: https://github.com/substack/node-falafel
  [Popcorn]: http://popcornjs.org/
  [Edward Tufte]: https://www.edwardtufte.com/tufte/
  [Hoisting]: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Statements/var#var_hoisting
