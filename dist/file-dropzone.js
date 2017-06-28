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
  }
};

var DRAG_ENTER_EVENT = 'dragenter';
var DRAG_LEAVE_EVENT = 'dragleave';
var DRAG_OVER_EVENT = 'dragover';
var DROP_EVENT = 'drop';
var CLICK_EVENT = 'click';

var DEFAULTS = {
  fileHoverClass: 'dropzone--file-hover',
  clickable: true,
  paramName: 'file',
  onFileChoose: function onFileChoose() {},
  onDragEnter: function onDragEnter() {},
  onDragLeave: function onDragLeave() {},
  onDragOver: function onDragOver() {},
  onDrop: function onDrop() {}
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

    this.target = target;
    this.options = u.assign(DEFAULTS, opts);
    this.disabled = false;

    this.init();
  }

  createClass(FileDropzone, [{
    key: 'init',
    value: function init() {
      var _this = this;

      if (this.options.clickable) {
        this.target.addClass('dropzone--clickable');
      }
      if (!this.target.find('input[type=file]') || this.target.find('input[type=file]').length <= 0) {
        this.target.append('<input type="file" hidden name="' + this.options.paramName + '" class="' + this.options.paramName + '" >');
      }

      this.fileInput = this.target.find('input[type=file]');

      this.target.on(DRAG_ENTER_EVENT, this._handleDragEnter.bind(this)).on(DRAG_LEAVE_EVENT, this._handleDragLeave.bind(this)).on(DRAG_OVER_EVENT, this._handleDragOver.bind(this)).on(DROP_EVENT, this._handleDrop.bind(this)).on(CLICK_EVENT, this._handleClick.bind(this));

      this.fileInput.on('click', function (evt) {
        evt.stopPropagation();
      }).on('change', function (evt) {
        if (_this.disabled) return;
        _this.file = evt.target.files[0];
        _this.options.onFileChoose && _this.options.onFileChoose();
      });
    }
  }, {
    key: '_handleDragEnter',
    value: function _handleDragEnter(evt) {
      if (this.disabled) return;
      evt.preventDefault();
      this.options.onDragEnter && this.options.onDragEnter(evt);
      this.target.addClass(this.options.fileHoverClass);
    }
  }, {
    key: '_handleDragLeave',
    value: function _handleDragLeave(evt) {
      if (this.disabled) return;
      evt.preventDefault();
      this.options.onDragLeave && this.options.onDragLeave(evt);
      this.target.removeClass(this.options.fileHoverClass);
    }
  }, {
    key: '_handleDragOver',
    value: function _handleDragOver(evt) {
      if (this.disabled) return;
      evt.preventDefault();
      this.options.onDragOver && this.options.onDragOver(evt);
    }
  }, {
    key: '_handleDrop',
    value: function _handleDrop(evt) {
      if (this.disabled) return;
      evt.preventDefault();
      this.options.onDrop && this.options.onDrop(evt);
      this.target.removeClass(this.options.fileHoverClass);
      var dt = evt.dataTransfer || evt.originalEvent.dataTransfer;
      var file = void 0;
      if (dt.items && dt.items.length) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = dt.items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            if (item.kind === 'file') {
              file = item.getAsFile();
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
      } else {
        file = dt.files[0];
      }

      this.file = file;
      this.options.onFileChoose && this.options.onFileChoose();
    }
  }, {
    key: '_handleClick',
    value: function _handleClick(evt) {
      if (this.disabled) return;
      if (!this.options.clickable) return;
      this.openFileChooser();
    }
  }, {
    key: 'openFileChooser',
    value: function openFileChooser() {
      this.fileInput.value = null;
      this.fileInput.click();
    }
  }, {
    key: 'getCurrentFile',
    value: function getCurrentFile() {
      return this.file;
    }
  }, {
    key: 'disable',
    value: function disable() {
      this.disabled = true;
      this.target.addClass('dropzone--disabled');
    }
  }, {
    key: 'enable',
    value: function enable() {
      this.disabled = false;
      this.target.removeClass('dropzone--disabled');
    }
  }]);
  return FileDropzone;
}();

return FileDropzone;

})));
