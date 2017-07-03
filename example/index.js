var myDropzone = new FileDropzone({
  target: '#box',
  fileHoverClass: 'entered',
  clickable: true,
  multiple: true,
  forceReplace: false,
  paramName: 'my-file',
  accept: 'image/*',
  onChange: function () {
    var files = this.getFiles()
    var elem = this.element
    elem.empty()
    files.forEach(function (item) {
      elem.append('<div class="file-name">' + item.name + '</div>')
    })
  },
  onEnter: function () {
    console.log('enter')
  },
  onLeave: function () {
    console.log('leave')
  },
  onHover: function () {
    console.log('hover')
  },
  onDrop: function () {
    console.log('drop')
  },
  onInvalid: function (files) {
    console.log('file invalid')
    console.log(files)
  },
  beforeAdd: function () {
    return true
  }
})