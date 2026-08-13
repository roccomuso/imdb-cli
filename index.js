#!/usr/bin/env node

var imdb = require('imdb-api')
var Table = require('cli-table')
var ora = require('ora')
var chalk = require('chalk')

var spinner = ora()
var arg = process.argv[2]

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

if (arg === '-h' || arg === '--help') {  // Display help message
  console.log(`
 ${chalk.yellow('imdb-cli')} - IMDB cli interface to retrive movies info.

 Usage: ${chalk.cyan('imdb-cli')} ${chalk.magenta('<movie-title>')}

 Example: ${chalk.cyan('imdb-cli')} ${chalk.magenta('the martian')}

 `)
  process.exit(1)
}

// istantiate table
var table = new Table()

var title = process.argv.slice(2).join(' ')

if (!title.length) {
  console.log(chalk.red('Please provide a valid Title!'))
  process.exit(1)
}

spinner.text = `Searching for: ${title}`
spinner.start() // Start ora spinner

// get movie info from IMDB
imdb.get(title, {apiKey: 'YOUR_API_KEY'}) //Get one here: http://www.omdbapi.com/apikey.aspx
    .then(function (data) {
      if (data.type === 'movie') {
        spinner.clear()
        var filteredData = cleanProps(data)
        Object.keys(filteredData).forEach(function (i) {
          var row = {}
          row[i] = filteredData[i]
          table.push(row)
          spinner.stop()
        })
        console.log(table.toString())
      } else {
        spinner.stop()
        console.log(chalk.red('Movie not found!'))
      }
    })
    .catch(function (err) {
      spinner.stop()
      console.log(chalk.red(err))
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
