import u from './util'
import $ from 'jquery'

let noop = function () { }
let _files = []
let _setFiles = function (files) {
  _files = files
}

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
  beforeAppend: noop
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

    var unitIndex = units.indexOf(unit.toLowerCase)
    if (unitIndex < 0) {
      throw new TypeError('The unit should be one of "tb", "gb", "mb", "kb" and "b", the default value is "b"')
    }

    return file.size / Math.pow(1024, unitIndex - 1)
  }

  init() {
    _setFiles.bind(this)([])
    if (this.options.clickable) {
      this.element.addClass('dropzone--clickable')
      this.element.on('click', this.openFileChooser.bind(this))
    }
    this.multiple = this.options.multiple || this.element.find('input[type=file]').attr('multiple') || false

    if (!this.element.find('input[type=file]') || this.element.find('input[type=file]').length <= 0) {
      this.element.append(`<input type="file" hidden name="${this.options.paramName}" class="${this.options.paramName}" >`)
    }

    this.fileInput = this.element.find('input[type=file]')

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
      _addFiles.bind(this)(files)
      if (!that.options.unique) {
        $(this).val('')
      }
    })

    _insetStyles()
  }

  getFiles() {
    return _files
  }

  removeFile(file) {
    let files = this.getFiles()
    let oldLen = files.length
    files = u.without(files, file)
    if (files.length < oldLen) {
      this.options.onChange && this.options.onChange.bind(this)()
    }
  }

  pop() {
    let files = this.getFiles()
    // let oldLen = files.length
    var removed = files.pop()
    _setFiles(files)
    this.options.onChange && this.options.onChange.bind(this)()
    return removed
  }

  openFileChooser() {
    this.fileInput.click()
  }

  clearAll() {
    _setFiles([])
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
}

function _addFiles(files) {
  var valid = []
  var invalid = []
  files.forEach(file => {
    if (u.fileTypeValid(file, this.accept)) {
      if (!this.options.unique || this.getFiles().indexOf(file) < 0) {
        valid.push(file)
      }
    } else {
      invalid.push(file)
    }
  })

  if (invalid.length) {
    this.onInvalid && this.onInvalid(invalid)
  }

  if (!valid[0]) return

  if (!this.multiple) {
    if (this.getFiles().length > 0) return
    valid = valid.slice(0, 1)
  }

  let canAdd = true
  if (this.options.beforeAppend) {
    let result = this.options.beforeAppend(valid)
    if (typeof result == 'boolean') {
      canAdd = result
    }
  }

  if (!canAdd) return

  if (!this.multiple) {
    _setFiles(valid.slice(0, 1))
  } else if (this.forceReplace) {
    _setFiles(valid)
  } else {
    _setFiles(this.getFiles().concat(valid))
  }
  this.options.onChange && this.options.onChange.bind(this)()
}

function _insetStyles() {
  $("<style>.dropzone--clickable { cursor: pointer; }</style>").appendTo("head")
}

function _handleDragEnter(evt) {
  if (this.disabled) return
  evt.preventDefault()
  this.options.onEnter && this.options.onEnter.bind(this)(evt)
  this.element.addClass(this.options.fileHoverClass)
}

function _handleDragLeave(evt) {
  if (this.disabled) return
  evt.preventDefault()
  this.options.onLeave && this.options.onLeave.bind(this)(evt)
  this.element.removeClass(this.options.fileHoverClass)
}

function _handleDragOver(evt) {
  if (this.disabled) return
  evt.preventDefault()
  this.options.onHover && this.options.onHover.bind(this)(evt)
}

function _handleDrop(evt) {
  if (this.disabled) return
  evt.preventDefault()
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
  if (!this.options.clickable) return
  this.openFileChooser()
}