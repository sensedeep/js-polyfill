/*
    js-polyfill.js -- Useful polyfills and globals (dump, loadJson, print, serialize)
 */

import blend from 'js-blend'
import clone from 'js-clone'

try {
    if (typeof global !== 'undefined') {
        ;
    } else if (typeof self !== 'undefined') {
        self.global = self
    } else if (typeof window !== 'undefined') {
        window.global = window
    } else {
        let self = Function('return this')()
        self.global = self
    }
} catch (e) {}

RegExp.prototype.toJSON = RegExp.prototype.toString
global.dump = (...args) => {
    let s = []
    for (let item of args) {
        s.push(JSON.stringify(item, null, 4))
    }
    print(s.join(' '))
}
global.print = (...args) => {
    console.log(...args)
}
global.serialize = (o, pretty = false) => JSON.stringify(o, null, pretty ? 4 : 0)
global.toTitle = (s) => (s ? (s[0].toUpperCase() + s.slice(1)) : '')
global.zpad = (n, size) => {
    var s = n + ''
    while (s.length < size) s = "0" + s
    return s
}
global.makeArray = (a) => {
    if (a != null) {
        if (Array.isArray(a)) {
            return a
        }
        return [a]
    }
    return []
}
global.assert = (a) => {
    if (!(a)) {
        console.log(`Assertion failed`, new Error('Assertion'), {bug: true})
        debugger;
    }
}
global.trap = (obj, prop) => {
    let actual = `_${prop}`
	obj[actual] = obj[prop]
    Object.defineProperty(obj, prop, {
        get: function () {
            return obj[actual]
        },
        set: function (value) {
            debugger
            obj[actual] = value;
        }
    })
}
const reduce = Function.bind.call(Function.call, Array.prototype.reduce)
const isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable)
const concat = Function.bind.call(Function.call, Array.prototype.concat)

/*
    Object.values and Object.entries
 */
const keys = Object.keys
if (!Object.values) {
    Object.values = function values(obj) {
        return reduce(keys(obj), (v, k) => concat(v, typeof k === 'string' && isEnumerable(obj, k) ? [obj[k]] : []), [])
    }
}

if (!Object.entries) {
    Object.entries = function entries(obj) {
        return reduce(keys(obj), (e, k) => concat(e, typeof k === 'string' && isEnumerable(obj, k) ? [[k, obj[k]]] : []), [])
    }
}

try {
    Object.defineProperty(Date.prototype, 'show', { get: function() {
        let s = this
        let hours = s.getHours()
        let ampm = hours >= 12 ? 'pm' : 'am';
        if (hours > 12) {
            hours -= 12
        }
        return `${s.getMonth() + 1}/${s.getDate()} ${hours}:${zpad(s.getMinutes(), 2)}:${zpad(s.getSeconds(), 2)}:${zpad(s.getMilliseconds(), 2)} ${ampm}`
    }})
} catch(err) {}

function template(s, ...contexts) {
    for (let context of contexts) {
        if (s.indexOf('${') < 0) {
            break
        }
        s = s.replace(/\${(.*?)}/g, (a, b) => {
            if (context[b]) {
                return context[b]
            } else {
                return a
            }
        })
    }
    return s.replace(/\${(.*?)}/g, '')
}

String.template = function(s, ...contexts) {
    return template(s, ...contexts)
}
String.prototype.template = function(...contexts) {
    return template(this, ...contexts)
}

String.isDefined = function (value) {
    return !(value == undefined || value === "" || value.length == 0);
}

String.prototype.portable = function() {
	return this.toString().replace(/\\/g, '/')
}

/*
    Convert array to an hash map
 */
Array.prototype.toMap = function (property, indexed = false) {
    let result = {}
    if (property) {
        for (let i = 0; i < this.length; i++) {
            let item = this[i]
            if (indexed) {
                result[item[property]] = i
            } else {
                result[item[property]] = item
            }
        }
    } else {
        for (let i = 0; i < this.length; i++) {
            let item = this[i]
            result[item] = i
        }
    }
    return result
}

Array.prototype.append = function(other) {
    Array.prototype.push.apply(this, other)
    return this
}

Array.prototype.unique = function() {
    return this.filter((value, index, self) => self.indexOf(value) === index)
}

Array.prototype.remove = function(set) {
    return this.filter((value, index, self) => set.indexOf(value) < 0)
}

//  Returns a number
Number.prototype.currency = function(places = 2) {
    let factor = Math.pow(10, places)
    return (Math.round(this * factor) / factor).toFixed(places) - 0
}

//  Returns a string
Number.prototype.money = function(places = 2) {
    let factor = Math.pow(10, places)
    return (Math.round(this * factor) / factor).toFixed(places)
}

Array.prototype.rotate = function(n) {
    this.unshift.apply(this, this.splice(n, this.length))
    return this
}

Number.prototype.round = function (places = 12) {
    return parseFloat(this).toPrecision(places) - 0
}

Object.keyFields = function(obj, property) {
    let result = []
    for (let [key,value] of Object.entries(obj)) {
        result.push(value[property])
    }
    return result
}

//  MOB - rename allow/deny or accept/reject
Object.white = function(obj, mask) {
    let result = {}
    if (!obj) {
        obj = {}
    }
    if (Array.isArray(mask)) {
        for (let field of mask) {
            if (obj[field] !== undefined) {
                result[field] = obj[field]
            }
        }
    } else if (typeof mask == 'string') {
        result[mask] = obj[mask]
    } else {
        for (let field of Object.keys(mask)) {
            if (obj[field] !== undefined) {
                result[field] = obj[field]
            }
        }
    }
    return result
}

//  MOB - rename allow/deny or accept/reject
Object.black = function(obj, mask) {
    let result
    if (!obj) {
        obj = {}
    }
    if (Array.isArray(mask)) {
        result = Object.assign({}, obj)
        for (let key of mask) {
            delete result[key]
        }
    } else if (typeof mask == 'string') {
        result = {}
        for (let [key,value] of Object.entries(obj)) {
            if (key != mask) {
                result[key] = value
            }
        }
        result[mask] = obj[mask]
    } else {
        result = {}
        for (let field of Object.keys(mask)) {
            if (obj[field] !== undefined) {
                result[field] = obj[field]
            }
        }
    }
    return result
}

Object.blend = blend
Object.clone = clone
