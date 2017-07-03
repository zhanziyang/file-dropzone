/*
 * loopRequest v1.0.0
 * https://github.com/zhanziyang/file-dropzone
 * 
 * Copyright (c) 2017 zhanziyang
 * Released under the MIT license
 */
  
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	(global.FileDropzone = factory(global.jQuery));
}(this, (function ($) { 'use strict';

$ = $ && 'default' in $ ? $['default'] : $;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var u = {
  isString: function isString(val) {
    return typeof val === 'string' || val instanceof String;
  },
  isArray: function isArray(val) {
    return Object.prototype.toString.call(val) === '[object Array]';
  },
  isObject: function isObject(val) {
    return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && !isArray(val);
  },
  addUnique: function addUnique(arr, val) {
    if (arr.indexOf(val) < 0) {
      arr.push(val);
    }
    return arr;
  },
  remove: function remove(arr, val) {
    var index = arr.indexOf(val);
    if (index >= 0) {
      arr.splice(index, 1);
    }

    return arr;
  },
  assign: function assign(target, source) {
    if (!target || !source) {
      return target;
    }

    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }

    return target;
  },
  without: function without(list, rejectedItem) {
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
  fileTypeValid: function fileTypeValid(file, type) {
    if (!type) {
      return true;
    }

    var baseMimetype = type.replace(/\/.*$/, '');
    var types = type.split(',');
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = types[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _type = _step.value;

        var t = _type.trim();
        if (/^\./.test(t)) {
          var filename = file.name.toLowerCase();
          if (filename.split('.').pop() === t.toLowerCase()) return true;
        } else if (/\/\*$/.test(t)) {
          var fileBaseType = file.type.replace(/\/.*$/, '');
          if (fileBaseType === baseMimetype) {
            return true;
          }
        } else if (file.type === _type) {
          return true;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return false;
  }
};

var noop = function noop() {};
var _files = [];
var _setFiles = function _setFiles(files) {
  _files = files;
};

var DEFAULTS = {
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
};

var FileDropzone = function () {
  function FileDropzone(selector, options) {
    classCallCheck(this, FileDropzone);

    var opts = options || {};
    var target = $(selector);

    if (!u.isString(selector) && u.isObject(selector) && !(selector instanceof $) && !(selector instanceof Element)) {
      opts = selector || {};
      target = $(opts.target);
    }

    if (!target || target.length <= 0) {
      throw new Error('No matched element.');
    }

    this.element = target;
    this.options = u.assign(DEFAULTS, opts);
    this.disabled = false;
    this.fileInput = null;
    this.multiple = false;

    this.init();
  }

  createClass(FileDropzone, [{
    key: 'init',
    value: function init() {
      _setFiles.bind(this)([]);
      if (this.options.clickable) {
        this.element.addClass('dropzone--clickable');
        this.element.on('click', this.openFileChooser.bind(this));
      }
      this.multiple = this.options.multiple || this.element.find('input[type=file]').attr('multiple') || false;

      if (!this.element.find('input[type=file]') || this.element.find('input[type=file]').length <= 0) {
        this.element.append('<input type="file" hidden name="' + this.options.paramName + '" class="' + this.options.paramName + '" >');
      }

      this.fileInput = this.element.find('input[type=file]');

      if (this.multiple) {
        this.fileInput.attr('multiple', 'multiple');
      }

      if (this.options.capture) {
        this.fileInput.attr('capture', this.options.capture);
      }

      if (this.options.accept) {
        this.fileInput.attr('accept', this.options.accept);
      }

      this.element.on('dragenter', _handleDragEnter.bind(this)).on('dragleave', _handleDragLeave.bind(this)).on('dragend', _handleDragLeave.bind(this)).on('dragover', _handleDragOver.bind(this)).on('drop', _handleDrop.bind(this));

      var that = this;

      this.fileInput.on('click', function (evt) {
        evt.stopPropagation();
      }).on('change', function (evt) {
        if (that.disabled) return;
        var fileList = evt.target.files;
        var files = [];
        for (var i = 0, len = fileList.length; i < len; i++) {
          var value = fileList[i];
          if (value instanceof File) {
            files.push(value);
          }
        }
        _addFiles.bind(this)(files);
        if (!that.options.unique) {
          $(this).val('');
        }
      });

      _insetStyles();
    }
  }, {
    key: 'getFiles',
    value: function getFiles() {
      return _files;
    }
  }, {
    key: 'removeFile',
    value: function removeFile(file) {
      var files = this.getFiles();
      var oldLen = files.length;
      files = u.without(files, file);
      if (files.length < oldLen) {
        this.options.onChange && this.options.onChange();
      }
    }
  }, {
    key: 'pop',
    value: function pop() {
      var files = this.getFiles();
      // let oldLen = files.length
      var removed = files.pop();
      _setFiles(files);
      this.options.onChange && this.options.onChange();
      return removed;
    }
  }, {
    key: 'openFileChooser',
    value: function openFileChooser() {
      this.fileInput.click();
    }
  }, {
    key: 'clearAll',
    value: function clearAll() {
      _setFiles([]);
      this.options.onChange && this.options.onChange();
    }
  }, {
    key: 'disable',
    value: function disable() {
      this.disabled = true;
      this.element.addClass('dropzone--disabled');
      this.fileInput.prop('disabled', true);
    }
  }, {
    key: 'enable',
    value: function enable() {
      this.disabled = false;
      this.element.removeClass('dropzone--disabled');
      this.fileInput.prop('disabled', false);
    }
  }], [{
    key: 'getFileSize',
    value: function getFileSize(file) {
      var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'b';

      var units = ['b', 'kb', 'mb', 'gb', 'tb'];
      if (!(file instanceof File)) {
        throw new TypeError('First argument "file" should be a File instance.');
      }
      if (!unit || typeof unit !== 'string') {
        unit = 'b';
      }
      if (unit == 'b') return file.size;

      var unitIndex = units.indexOf(unit.toLowerCase);
      if (unitIndex < 0) {
        throw new TypeError('The unit should be one of "tb", "gb", "mb", "kb" and "b", the default value is "b"');
      }

      return file.size / Math.pow(1024, unitIndex - 1);
    }
  }]);
  return FileDropzone;
}();

function _addFiles(files) {
  var _this = this;

  var valid = [];
  var invalid = [];
  files.forEach(function (file) {
    if (u.fileTypeValid(file, _this.accept)) {
      if (!_this.options.unique || _this.getFiles().indexOf(file) < 0) {
        valid.push(file);
      }
    } else {
      invalid.push(file);
    }
  });

  if (invalid.length) {
    this.onInvalid && this.onInvalid(invalid);
  }

  if (!valid[0]) return;

  if (!this.multiple) {
    if (this.getFiles().length > 0) return;
    valid = valid.slice(0, 1);
  }

  var canAdd = true;
  if (this.options.beforeAppend) {
    var result = this.options.beforeAppend(valid);
    if (typeof result == 'boolean') {
      canAdd = result;
    }
  }

  if (!canAdd) return;

  if (!this.multiple) {
    _setFiles(valid.slice(0, 1));
  } else if (this.forceReplace) {
    _setFiles(valid);
  } else {
    _setFiles(this.getFiles().concat(valid));
  }
  this.options.onChange && this.options.onChange();
}

function _insetStyles() {
  $("<style>.dropzone--clickable { cursor: pointer; }</style>").appendTo("head");
}

function _handleDragEnter(evt) {
  if (this.disabled) return;
  evt.preventDefault();
  this.options.onEnter && this.options.onEnter(evt);
  this.element.addClass(this.options.fileHoverClass);
}

function _handleDragLeave(evt) {
  if (this.disabled) return;
  evt.preventDefault();
  this.options.onLeave && this.options.onLeave(evt);
  this.element.removeClass(this.options.fileHoverClass);
}

function _handleDragOver(evt) {
  if (this.disabled) return;
  evt.preventDefault();
  this.options.onHover && this.options.onHover(evt);
}

function _handleDrop(evt) {
  if (this.disabled) return;
  evt.preventDefault();
  this.options.onDrop && this.options.onDrop(evt);
  this.element.removeClass(this.options.fileHoverClass);
  var dt = evt.dataTransfer || evt.originalEvent.dataTransfer;
  var files = [];
  if (dt.items && dt.items.length) {
    for (var i = 0, len = dt.items.length; i < len; i++) {
      var item = dt.items[i];
      if (item.kind === 'file') {
        files.push(item.getAsFile());
      }
    }
  } else {
    files = dt.files;
  }

  _addFiles.bind(this)(files);
}

return FileDropzone;

})));
