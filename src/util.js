export default {
  isString(val) {
    return typeof val === 'string' || val instanceof String
  },

  isArray(val) {
    return Object.prototype.toString.call(val) === '[object Array]'
  },

  isObject(val) {
    return val && typeof val === 'object' && !isArray(val)
  },

  addUnique(arr, val) {
    if (arr.indexOf(val) < 0) {
      arr.push(val)
    }
    return arr
  },

  remove(arr, val) {
    var index = arr.indexOf(val)
    if (index >= 0) {
      arr.splice(index, 1)
    }

    return arr
  },

  assign(target, source) {
    if (!target || !source) {
      return target
    }

    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key]
      }
    }

    return target
  }
}