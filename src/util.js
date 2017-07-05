export default {
  isString(val) {
    return typeof val === 'string' || val instanceof String
  },

  isArray(val) {
    return Object.prototype.toString.call(val) === '[object Array]'
  },

  isObject(val) {
    return val && typeof val === 'object' && !this.isArray(val)
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
  },

  without(list, rejectedItem) {
    var item, j, len, results;
    results = [];
    for (j = 0, len = list.length; j < len; j++) {
      item = list[j];
      if (item !== rejectedItem) {
        results.push(item);
      }
    }
    return results;
  },

  fileTypeValid(file, type) {
    if (!type) {
      return true
    }

    let baseMimetype = type.replace(/\/.*$/, '')
    let types = type.split(',')
    for (let type of types) {
      let t = type.trim()
      if (/^\./.test(t)) {
        let filename = file.name.toLowerCase()
        if (filename.split('.').pop() === t.toLowerCase()) return true
      } else if (/\/\*$/.test(t)) {
        var fileBaseType = file.type.replace(/\/.*$/, '')
        if (fileBaseType === baseMimetype) {
          return true
        }
      } else if (file.type === type) {
        return true
      }
    }

    return false
  },

  eventHasFile(evt) {
    var dt = evt.dataTransfer || evt.originalEvent.dataTransfer
    if (dt.types) {
      for (var i = 0, len = dt.types.length; i < len; i++) {
        if (dt.types[i] == "Files") {
          return true
        }
      }
    }

    return false
  },

  getFilesFromEvent(evt) {
    let dt = evt.dataTransfer || evt.originalEvent.dataTransfer
    let files = []
    if (dt.items && dt.items.length) {
      for (let i = 0, len = dt.items.length; i < len; i++) {
        let item = dt.items[i]
        if (item.kind === 'file') {
          files.push(item.getAsFile())
        }
      }
    } else {
      files = dt.files
    }

    return files
  }
}