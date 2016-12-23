#!/usr/bin/env node

var imdb = require('imdb-api');
var Table = require('cli-table');

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
];

// istantiate table
var table = new Table();

var title = process.argv.slice(2).join(' ');

if (title.length == 0){
	console.log('Please provide a valid Title.');
	process.exit(1);
}

console.log('Searching for:', title);

// get movie info from IMDB
imdb.get(title)
    .then(function(data) {
        if (data.type === 'movie') {
            var filtered_data = clean_props(data);
            Object.keys(filtered_data).forEach(function(i) {
                var row = {};
                row[i] = filtered_data[i];
                table.push(row);
            });
            console.log(table.toString());
        } else
            console.log('No movie found!');
    })
    .catch(function(err) {
        console.log(err);
    });


/* util functions */

function clean_props(obj) {
    var newObj = {};
    fields.forEach(function(k) {
        if (obj.hasOwnProperty(k)) newObj[k] = limit_chars(obj[k]);
    });
    return newObj;
}

function limit_chars(data){
	 return (data.length > 60) ? data.slice(0,57)+'...' : data;
}
