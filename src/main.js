import u from './util'
import $ from 'jquery'

const DRAG_ENTER_EVENT = 'dragenter',
  DRAG_LEAVE_EVENT = 'dragleave',
  DRAG_OVER_EVENT = 'dragover',
  DROP_EVENT = 'drop',
  CLICK_EVENT = 'click'

let func = function () { }

const DEFAULTS = {
  fileHoverClass: 'dropzone--file-hover',
  clickable: true,
  multiple: false,
  paramName: 'file',
  accept: '',
  capture: true,
  unique: false,
  onChange: func,
  onEnter: func,
  onLeave: func,
  onHover: func,
  onDrop: func,
  onSomeInvalid: func
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

    this.element.on(DRAG_ENTER_EVENT, this._handleDragEnter.bind(this))
      .on(DRAG_LEAVE_EVENT, this._handleDragLeave.bind(this))
      .on(DRAG_OVER_EVENT, this._handleDragOver.bind(this))
      .on(DROP_EVENT, this._handleDrop.bind(this))

    var that = this

    this.fileInput.on('click', (evt) => {
      evt.stopPropagation()
    }).on('change', function (evt) {
      console.log('change')
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

    this.insetStyles()
  }

  insetStyles() {
    $("<style>.dropzone--clickable { cursor: pointer; }</style>").appendTo("head")
  }

  _handleDragEnter(evt) {
    if (this.disabled) return
    evt.preventDefault()
    this.options.onEnter && this.options.onEnter(evt)
    this.element.addClass(this.options.fileHoverClass)
  }

  _handleDragLeave(evt) {
    if (this.disabled) return
    evt.preventDefault()
    this.options.onLeave && this.options.onLeave(evt)
    this.element.removeClass(this.options.fileHoverClass)
  }

  _handleDragOver(evt) {
    if (this.disabled) return
    evt.preventDefault()
    this.options.onHover && this.options.onHover(evt)
  }

  _handleDrop(evt) {
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

  _handleClick(evt) {
    if (this.disabled) return
    if (!this.options.clickable) return
    this.openFileChooser()
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

    this.files = this.files.concat(valid)
    this.options.onChange && this.options.onChange()
  }

  removeFile(file) {
    let oldLen = this.files.length
    u.without(file, this.files)
    if (this.files.length < oldLen) {
      this.options.onChange && this.options.onChange()
    }
  }

  openFileChooser() {
    this.fileInput.click()
  }

  getFiles() {
    return this.files
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
