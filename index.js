#!/usr/bin/env node

var imdb = require('imdb-api')
var Table = require('cli-table')

// extracted fields
var fields = [
  'title',
  'type',
  'year',
  'genres',
  'director',
  'actors',
  'plot',
  'rating',
  'votes'
]

// istantiate table
var table = new Table()

var title = process.argv.slice(2).join(' ')

if (!title.length) {
  console.log('Please provide a valid Title.')
  process.exit(1)
}

console.log('Searching for:', title)

// get movie info from IMDB
imdb.get(title)
    .then(function (data) {
      if (data.type === 'movie') {
        var filteredData = cleanProps(data)
        Object.keys(filteredData).forEach(function (i) {
          var row = {}
          row[i] = filteredData[i]
          table.push(row)
        })
        console.log(table.toString())
      } else {
        console.log('No movie found!')
      }
    })
    .catch(function (err) {
      console.log(err)
    })

/* util functions */

function cleanProps (obj) {
  var newObj = {}
  fields.forEach(function (k) {
    if (obj.hasOwnProperty(k)) newObj[k] = limitChars(obj[k])
  })
  return newObj
}

function limitChars (data) {
  return (data.length > 60) ? data.slice(0, 57) + '...' : data
}
