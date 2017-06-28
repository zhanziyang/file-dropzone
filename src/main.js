import u from './util'
import $ from 'jquery'

const DRAG_ENTER_EVENT = 'dragenter',
  DRAG_LEAVE_EVENT = 'dragleave',
  DRAG_OVER_EVENT = 'dragover',
  DROP_EVENT = 'drop',
  CLICK_EVENT = 'click'

const DEFAULTS = {
  fileHoverClass: 'dropzone--file-hover',
  clickable: true,
  paramName: 'file',
  onFileChoose: function () { },
  onDragEnter: function () { },
  onDragLeave: function () { },
  onDragOver: function () { },
  onDrop: function () { }
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

    this.target = target
    this.options = u.assign(DEFAULTS, opts)
    this.disabled = false

    this.init()
  }

  init() {
    if (this.options.clickable) {
      this.target.addClass('dropzone--clickable')
    }
    if (!this.target.find('input[type=file]') || this.target.find('input[type=file]').length <= 0) {
      this.target.append(`<input type="file" hidden name="${this.options.paramName}" class="${this.options.paramName}" >`)
    }

    this.fileInput = this.target.find('input[type=file]')

    this.target.on(DRAG_ENTER_EVENT, this._handleDragEnter.bind(this))
      .on(DRAG_LEAVE_EVENT, this._handleDragLeave.bind(this))
      .on(DRAG_OVER_EVENT, this._handleDragOver.bind(this))
      .on(DROP_EVENT, this._handleDrop.bind(this))
      .on(CLICK_EVENT, this._handleClick.bind(this))

    this.fileInput.on('click', (evt) => {
      evt.stopPropagation()
    }).on('change', (evt) => {
      if (this.disabled) return
      this.file = evt.target.files[0]
      this.options.onFileChoose && this.options.onFileChoose()
    })
  }

  _handleDragEnter(evt) {
    if (this.disabled) return
    evt.preventDefault()
    this.options.onDragEnter && this.options.onDragEnter(evt)
    this.target.addClass(this.options.fileHoverClass)
  }

  _handleDragLeave(evt) {
    if (this.disabled) return
    evt.preventDefault()
    this.options.onDragLeave && this.options.onDragLeave(evt)
    this.target.removeClass(this.options.fileHoverClass)
  }

  _handleDragOver(evt) {
    if (this.disabled) return
    evt.preventDefault()
    this.options.onDragOver && this.options.onDragOver(evt)
  }

  _handleDrop(evt) {
    if (this.disabled) return
    evt.preventDefault()
    this.options.onDrop && this.options.onDrop(evt)
    this.target.removeClass(this.options.fileHoverClass)
    let dt = evt.dataTransfer || evt.originalEvent.dataTransfer
    let file
    if (dt.items && dt.items.length) {
      for (let item of dt.items) {
        if (item.kind === 'file') {
          file = item.getAsFile()
        }
      }
    } else {
      file = dt.files[0]
    }

    this.file = file
    this.options.onFileChoose && this.options.onFileChoose()
  }

  _handleClick(evt) {
    if (this.disabled) return
    if (!this.options.clickable) return
    this.openFileChooser()
  }

  openFileChooser() {
    this.fileInput.value = null
    this.fileInput.click()
  }

  getCurrentFile() {
    return this.file
  }

  disable() {
    this.disabled = true
    this.target.addClass('dropzone--disabled')
  }

  enable() {
    this.disabled = false
    this.target.removeClass('dropzone--disabled')
  }
}
