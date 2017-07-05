import u from './util'
import $ from 'jquery'

let noop = function () { }
let _files = []
let _setFiles = function (files) {
  _files = files
}
let dragTrack = 0

const DEFAULTS = {
  target: '',
  fileHoverClass: 'dropzone--file-hover',
  clickable: true,
  multiple: true,
  paramName: 'file',
  accept: '',
  capture: true,
  unique: false,
  forceReplace: false,
  onChange: noop,
  onEnter: noop,
  onLeave: noop,
  onHover: noop,
  onDrop: noop,
  onInvalid: noop,
  beforeAdd: noop
}

export default class FileDropzone {
  constructor(selector, options) {
    let opts = options || {}
    let target = $(selector)

    if (!u.isString(selector) && u.isObject(selector) && !(selector instanceof $) && !(selector instanceof Element)) {
      opts = selector || {}
      target = $(opts.target)
    }

    if (!target || target.length <= 0) {
      throw new Error('No matched element.')
    }

    this.element = target
    this.options = u.assign(DEFAULTS, opts)
    this.disabled = false
    this.fileInput = null
    this.multiple = false

    this.init()
  }

  static getFileSize(file, unit = 'b') {
    let units = ['b', 'kb', 'mb', 'gb', 'tb']
    if (!(file instanceof File)) {
      throw new TypeError('First argument "file" should be a File instance.')
    }
    if (!unit || typeof unit !== 'string') {
      unit = 'b'
    }
    if (unit == 'b') return file.size

    var unitIndex = units.indexOf(unit.toLowerCase())
    if (unitIndex < 0) {
      throw new TypeError('The unit should be one of "tb", "gb", "mb", "kb" and "b", the default value is "b"')
    }

    return file.size / Math.pow(1024, unitIndex)
  }

  init() {
    _setFiles.bind(this)([])
    this.clickable = this.options.clickable
    if (this.clickable) {
      this.enableClick()
    }
    this.element[0].addEventListener('click', _handleClick.bind(this))
    this.multiple = typeof this.options.multiple === 'boolean' ? this.options.multiple : true

    this.fileInput = $(`<input type="file" hidden name="${this.options.paramName}" class="${this.options.paramName}" >`)

    this.element.next(this.fileInput)

    if (this.multiple) {
      this.fileInput.attr('multiple', 'multiple')
    }

    if (this.options.capture) {
      this.fileInput.attr('capture', this.options.capture)
    }

    if (this.options.accept) {
      this.fileInput.attr('accept', this.options.accept)
    }

    this.element.on('dragenter', _handleDragEnter.bind(this))
      .on('dragleave', _handleDragLeave.bind(this))
      .on('dragend', _handleDragLeave.bind(this))
      .on('dragover', _handleDragOver.bind(this))
      .on('drop', _handleDrop.bind(this))

    var that = this

    this.fileInput.on('click', (evt) => {
      evt.stopPropagation()
    }).on('change', function (evt) {
      if (that.disabled) return
      var fileList = evt.target.files
      var files = []
      for (var i = 0, len = fileList.length; i < len; i++) {
        let value = fileList[i]
        if (value instanceof File) {
          files.push(value)
        }
      }
      _addFiles.bind(that)(files)
      if (!that.options.unique) {
        $(this).val('')
      }
    })

    _insetStyles()
  }

  getFiles() {
    return _files
  }

  removeFile(arg) {
    let files = this.getFiles()
    let oldLen = files.length
    var fileToRemove
    if (arg instanceof File) {
      fileToRemove = arg
      var newList = u.without(files, fileToRemove)
      _setFiles.bind(this)(newList)
    } else if (typeof arg === 'number') {
      fileToRemove = files.splice(arg, 1)[0]
    }
    if (this.getFiles().length === oldLen - 1) {
      this.options.onChange && this.options.onChange.bind(this)()
      return fileToRemove
    } else {
      return null
    }
  }

  pop() {
    let files = this.getFiles()
    if (!files.length) {
      return null
    }
    var removed = files.pop()
    _setFiles.bind(this)(files)
    this.options.onChange && this.options.onChange.bind(this)()
    return removed
  }

  shift() {
    let files = this.getFiles()
    if (!files.length) {
      return null
    }
    var removed = files.shift()
    _setFiles.bind(this)(files)
    this.options.onChange && this.options.onChange.bind(this)()
    return removed
  }

  openFileChooser() {
    this.fileInput.click()
  }

  clearAll() {
    _setFiles.bind(this)([])
    this.options.onChange && this.options.onChange.bind(this)()
  }

  disable() {
    this.disabled = true
    this.element.addClass('dropzone--disabled')
    this.fileInput.prop('disabled', true)
  }

  enable() {
    this.disabled = false
    this.element.removeClass('dropzone--disabled')
    this.fileInput.prop('disabled', false)
  }

  disableClick() {
    this.element.removeClass('dropzone--clickable')
    this.clickable = false
  }

  enableClick() {
    this.element.addClass('dropzone--clickable')
    this.clickable = true
  }
}

function _addFiles(files) {
  var valid = []
  var invalid = []
  files.forEach(file => {
    if (u.fileTypeValid(file, this.options.accept)) {
      if (!this.options.unique || this.getFiles().indexOf(file) < 0) {
        valid.push(file)
      }
    } else {
      invalid.push(file)
    }
  })

  if (invalid.length) {
    this.options.onInvalid && this.options.onInvalid.bind(this)(invalid)
  }

  if (!valid[0]) return

  if (!this.multiple) {
    valid = valid.slice(0, 1)
  }

  let canAdd = true
  if (this.options.beforeAdd) {
    let result = this.options.beforeAdd.bind(this)(valid)
    if (typeof result == 'boolean') {
      canAdd = result
    }
  }

  if (!canAdd) return

  if (!this.multiple || this.options.forceReplace) {
    _setFiles.bind(this)(valid)
  } else {
    _setFiles.bind(this)(this.getFiles().concat(valid))
  }
  this.options.onChange && this.options.onChange.bind(this)()
}

function _insetStyles() {
  if (!window.__dropzone_styled_inserted) {
    $(`<style>
      .dropzone--clickable { cursor: pointer; }
      .dropzone--file-hover { box-shadow: inset 0 0 10px #aaa; }
    </style>`
    ).appendTo("head")

    window.__dropzone_styled_inserted = true
  }
}

function _handleDragEnter(evt) {
  if (this.disabled) return
  evt.preventDefault()
  dragTrack++
  if (dragTrack == 1) {
    this.options.onEnter && this.options.onEnter.bind(this)(evt)
    this.element.addClass(this.options.fileHoverClass)
  }
}

function _handleDragLeave(evt) {
  if (this.disabled) return
  evt.preventDefault()
  dragTrack--
  if (dragTrack === 0) {
    this.options.onLeave && this.options.onLeave.bind(this)(evt)
    this.element.removeClass(this.options.fileHoverClass)
  }
}

function _handleDragOver(evt) {
  if (this.disabled) return
  evt.preventDefault()
  this.options.onHover && this.options.onHover.bind(this)(evt)
}

function _handleDrop(evt) {
  if (this.disabled) return
  evt.preventDefault()
  dragTrack--
  this.options.onDrop && this.options.onDrop.bind(this)(evt)
  this.element.removeClass(this.options.fileHoverClass)
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

  _addFiles.bind(this)(files)
}

function _handleClick(evt) {
  if (this.disabled) return
  if (!this.clickable) return
  this.openFileChooser()
}