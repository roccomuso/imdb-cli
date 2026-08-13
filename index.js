#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'
import imdb from 'imdb-api'
import Table from 'cli-table3'
import ora from 'ora'
import chalk from 'chalk'

const CONFIG_DIR = join(homedir(), '.config', 'imdb-cli')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

// fields extracted from the movie data for display
const FIELDS = [
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

async function readConfig () {
  try {
    return JSON.parse(await readFile(CONFIG_FILE, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return {}
    throw err
  }
}

async function writeConfig (config) {
  await mkdir(CONFIG_DIR, { recursive: true })
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
}

async function promptForApiKey () {
  console.log(chalk.yellow('\n No OMDb API key found.'))
  console.log(` Get a free one at ${chalk.cyan('http://www.omdbapi.com/apikey.aspx')}\n`)

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const apiKey = (await rl.question(' Enter your OMDb API key: ')).trim()
  rl.close()
  return apiKey
}

// resolves the API key from env, saved config, or an interactive prompt (saved for next time)
async function getApiKey () {
  if (process.env.IMDB_API_KEY) return process.env.IMDB_API_KEY

  const config = await readConfig()
  if (config.apiKey) return config.apiKey

  const apiKey = await promptForApiKey()
  if (!apiKey) {
    console.log(chalk.red('An API key is required to use imdb-cli.'))
    process.exit(1)
  }

  await writeConfig({ ...config, apiKey })
  console.log(chalk.green(`\n Saved API key to ${CONFIG_FILE}\n`))
  return apiKey
}

function printHelp () {
  console.log(`
 ${chalk.yellow('imdb-cli')} - IMDB cli interface to retrive movies info.

 Usage: ${chalk.cyan('imdb-cli')} ${chalk.magenta('<movie-title>')}

 Example: ${chalk.cyan('imdb-cli')} ${chalk.magenta('the martian')}

 `)
}

function limitChars (data) {
  return data.length > 60 ? `${data.slice(0, 57)}...` : data
}

function cleanProps (obj) {
  const filtered = {}
  for (const key of FIELDS) {
    if (Object.hasOwn(obj, key)) filtered[key] = limitChars(String(obj[key]))
  }
  return filtered
}

async function main () {
  const arg = process.argv[2]

  if (arg === '-h' || arg === '--help') {
    printHelp()
    return
  }

  const title = process.argv.slice(2).join(' ')

  if (!title.length) {
    console.log(chalk.red('Please provide a valid Title!'))
    process.exit(1)
  }

  const apiKey = await getApiKey()

  const spinner = ora(`Searching for: ${title}`).start()

  try {
    const data = await imdb.get({ name: title }, { apiKey })
    spinner.stop()

    if (data.type !== 'movie') {
      console.log(chalk.red('Movie not found!'))
      return
    }

    const table = new Table()
    const filteredData = cleanProps(data)

    for (const [key, value] of Object.entries(filteredData)) {
      table.push({ [key]: value })
    }

    console.log(table.toString())
  } catch (err) {
    spinner.stop()
    console.log(chalk.red(err.message || err))
    process.exitCode = 1
  }
}

main()
