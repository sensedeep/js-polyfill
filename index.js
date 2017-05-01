/*
    js-polyfill.js -- Useful polyfills and globals (dump, loadJson, print, serialize)
 */

try { window.global = window } catch (e) {}

RegExp.prototype.toJSON = RegExp.prototype.toString
global.dump = (...args) => { for (let item of args) print(JSON.stringify(item, null, 4)) }
global.print = (...args) => console.log(...args)
global.serialize = (o, pretty = false) => JSON.stringify(o, null, pretty ? 4 : 0)
global.toTitle = (s) => (s ? (s[0].toUpperCase() + s.slice(1)) : '')
global.zpad = (n, size) => {
    var s = n + ''
    while (s.length < size) s = "0" + s
    return s
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

String.prototype.template = function(context) {
    /*
        Ensure all ${keywords} are defined. Set to '' if not defined.
     */
    let text = this.toString()
    let matches = text.match(/\$\{[^}]*}/gm)
    if (matches) {
        for (let name of matches) {
            let word = name.slice(2).slice(0, -1)
            context[word] = context[word] || ''
        }
        let fn = Function('_context_', 'with (_context_) { return `' + text + '`}')
        return fn(context)
    }
    return text
}

String.prototype.portable = function() {
	return this.toString().replace(/\\/g, '/')
}

Array.prototype.toMap = function (property, indexed = true) {
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

Number.prototype.currency = function() {
    return (Math.round(this * 100) / 100).toFixed(2)
}

Object.keyFields = function(obj, property) {
    let result = []
    for (let [key,value] of Object.entries(obj)) {
        result.push(value[property])
    }
    return result
}

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

