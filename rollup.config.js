const resolve = require('rollup-plugin-node-resolve')
const commentjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')
const { version, license } = require('./package.json')

let min = process.env.BUILD === 'min'

module.exports = {
  entry: 'src/main.js',
  dest: `dist/file-dropzone${min ? '.min' : ''}.js`,
  format: 'umd',
  moduleName: 'FileDropzone',
  external: ['jquery'],
  globals: {
    jquery: 'jQuery'
  },
  banner: `\
/*
 * loopRequest v${version}
 * https://github.com/zhanziyang/file-dropzone
 * 
 * Copyright (c) ${new Date().getFullYear()} zhanziyang
 * Released under the ${license} license
 */
  `,
  plugins: [
    commentjs(),
    resolve(),
    babel({
      "presets": [
        [
          "es2015",
          {
            "modules": false
          }
        ]
      ],
      "plugins": [
        "external-helpers"
      ],
      "exclude": "node_modules/**"
    }),
    (min && uglify({
      output: {
        comments: /zhanziyang/
      }
    }))
  ]
}