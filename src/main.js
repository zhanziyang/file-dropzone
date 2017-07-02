import u from './util'
import $ from 'jquery'

let noop = function () { }

const DEFAULTS = {
  target: '',
  fileHoverClass: 'dropzone--file-hover',
  clickable: true,
  multiple: true,
  paramName: 'file',
  accept: '',
  capture: true,
  unique: false,
  onChange: noop,
  onEnter: noop,
  onLeave: noop,
  onHover: noop,
  onDrop: noop,
  onSomeInvalid: noop
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
    this.files = []
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
      that.addFiles(files)
      if (!that.options.unique) {
        $(this).val('')
      }
    })

    _insetStyles()
  }

  addFiles(files) {
    var valid = []
    var invalid = []
    files.forEach(file => {
      if (u.fileTypeValid(file, this.accept)) {
        if (!this.options.unique || this.files.indexOf(file) < 0) {
          valid.push(file)
        }
      } else {
        invalid.push(file)
      }
    })

    if (invalid.length) {
      this.onSomeInvalid && this.onSomeInvalid(invalid)
    }

    if (!valid[0]) return

    if (!this.multiple) {
      if (this.files.length > 0) return
      valid = valid.slice(0, 1)
    }

    this.files = this.files.concat(valid)
    this.options.onChange && this.options.onChange()
  }

  removeFile(file) {
    let oldLen = this.files.length
    this.files = u.without(this.files, file)
    if (this.files.length < oldLen) {
      this.options.onChange && this.options.onChange()
    }
  }

  openFileChooser() {
    this.fileInput.click()
  }

  clearAll() {
    this.files = []
    this.options.onChange && this.options.onChange()
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


function _insetStyles() {
  $("<style>.dropzone--clickable { cursor: pointer; }</style>").appendTo("head")
}

function _handleDragEnter(evt) {
  if (this.disabled) return
  evt.preventDefault()
  this.options.onEnter && this.options.onEnter(evt)
  this.element.addClass(this.options.fileHoverClass)
}

function _handleDragLeave(evt) {
  if (this.disabled) return
  evt.preventDefault()
  this.options.onLeave && this.options.onLeave(evt)
  this.element.removeClass(this.options.fileHoverClass)
}

function _handleDragOver(evt) {
  if (this.disabled) return
  evt.preventDefault()
  this.options.onHover && this.options.onHover(evt)
}

function _handleDrop(evt) {
  if (this.disabled) return
  evt.preventDefault()
  this.options.onDrop && this.options.onDrop(evt)
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

  this.addFiles(files)
}

function _handleClick(evt) {
  if (this.disabled) return
  if (!this.options.clickable) return
  this.openFileChooser()
}