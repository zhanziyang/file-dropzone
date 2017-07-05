# file-dropzone
A simple lightweight file dropzone component based on jQuery. You can easily make any existing element become a dropzone that holds files.

```js
var myDropzone = new FileDropzone({
  target: '#box',
  fileHoverClass: 'entered',
  clickable: true,
  multiple: true,
  forceReplace: false,
  paramName: 'my-file',
  accept: '',
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
```

## Construtor

```js
// method 1
var options = {}
new FileDropzone($('#container'), options)

// method 2
var options = { target: '#container' }
new FileDropzone(options)
```

## Options

| option         | type     | explain                                                                                                                                                                                                            | default                |
|----------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| **target**         | string   | css selector string. specifies which element you want to be a dropzone                                                                                                                                             |                        |
| **fileHoverClass** | string   | class name that will be added to target element when file dragged over it                                                                                                                                          | `'dropzone--file-hover'` |
| **clickable**      | boolean  | whether the file choosing window will pop up when target element is clicked                                                                                                                              | `true`                   |
| **multiple**       | boolean  | whether the dropzone can hold multiple files                                                                                                                                                                       | `true`                   |
| **unique**         | boolean  | whether to ignore duplicate files when adding                                                                                                                                                                      | `false`                  |
| **forceReplace**   | boolean  | whether to replace the existing file list when adding. If set to `false`, new files will append to the list                                                                                                          | `false`                  |
| **accept**         | string   | mimetype or file extensions separated by comma to specify a certain types of files the dropzone accepts                                                                                                            |                        |
| **capture**        | boolean  | same as `input[type=file]` element's `capture` attribute                                                                                                                                                               | `true`                   |
| **paramName**      | string   | same as `input[type=file]` element's `name` attribute                                                                                                                                                                  | `'file'`                 |
| **onChange**       | function | called when file list length changed                                                                                                                                                                               |                        |
| **onEnter**        | function | called when file dragged enters the target element. accepts 1 argument which is native `dragenter` event object.                                                                                                     |                        |
| **onLeave**        | function | called when file dragged leaves the target element. accepts 1 argument which is native `dragleave` event object.                                                                                                     |                        |
| **onHover**        | function | called when file dragged moves on the target element. accepts 1 argument which is native `dragover` event object.                                                                                                    |                        |
| **onDrop**         | function | called when file dropped into to target element. accepts 1 argument which is native `drop` event object.                                                                                                             |                        |
| **onInvalid**      | function | called when invalid type files found among the files user chooses. accepts 1 argument which is an array of the spotted invalid files.                                                                              |                        |
| **beforeAdd**      | function | called right before adding new files to the list. accepts 1 argument which is an array of the valid files that are about to be added to the list. If the function return `false`, the adding action will be stopped. |                        |

## Methods

#### getFiles()

- Returns an array of files ([File](https://developer.mozilla.org/en-US/docs/Web/API/File) object) which are currently in the dropzone.

#### removeFile(foo)

- args:
  - `foo`: (File object or Number) if `foo` is a file which is already in the file list, it will be removed from the list. If `foo` is a number, the number indicates the index of file that will be removed.
- Returns the removed file if it is removed successfully, otherwise returns `null`.

#### pop()

- This method tries to remove the last file from the current file list.
- Returns the removed file or `null` if the list is empty.

#### shift()

- This method tries to remove the first file from the current file list.
- Returns the removed file or `null` if the list is empty.

#### clearAll()

- This method tries to clear the current file list ,making it an empty array.

#### openFileChooser()

- This method programmatically opens the file choosing window of os for user to add files.

#### disable()

- This method disables click and drag&drop to prevent file adding, which is enabled by default.

#### enable()

- This method does the opposite to `disable()`.

#### disableClick()

- This method prevent file choosing window of os to pop up on click, which is enabled by default.

#### enableClick()

- This method does the opposite to `disableClick()`.

#### `static` getFileSize(file, unit)

- args:
  - `file`: (File object) the file whose size you want to get.
  - `unit`: specifies the unit. It should be one of these: b, kb, mb, gb, tb.
- Returns file size (Number) in the unit specified.
- This is a static method. You should call it on the `FileDropzone` constructor.

```js
var file = myDropzone.getFiles()[0]
var size = FileDropzone.getFileSize(file, 'mb')
```
