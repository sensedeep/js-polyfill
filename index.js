/*
    node-global Useful globals
 */

RegExp.prototype.toJSON = RegExp.prototype.toString
global.print = (...args) => console.log(...args)
global.serialize = function(o, pretty = false) { return JSON.stringify(o, null, pretty ? 4 : 0) }
global.dump = (...args) => { for (let item of args) print(JSON.stringify(item, null, 4)) }
