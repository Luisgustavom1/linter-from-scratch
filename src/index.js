#!/usr/bin/env node
import { parseArgs } from "node:util"
import fs from "node:fs"
import chalk from 'chalk'
import * as espree from "espree"
import path from "path"
import { Reporter } from "./reporter.js"

function getFilePathFromCLI() {
  try {
    const { values: { file } } = parseArgs({
      options: {
        file: {
          type: 'string',
          short: 'f'
        }
      }
    });
    
    if (!file) throw new Error();

    return file;
  } catch (error) {
    console.error(chalk.red('Error: Missing file path. Please provide a file path using the -f or --file flag.'));
    process.exit(1);
  }
}

const filePath = getFilePathFromCLI();
const outputFilePath = path.resolve(process.cwd(), `${path.basename(filePath, '.js')}.linted.js`);
const code = fs.readFileSync(filePath, 'utf-8');
const ast = espree.parse(code, { 
  ecmaVersion: 2020,
  loc: true,
  sourceType: 'module'
});

Reporter.report({
  errors: [{
    message: "Missing semicolon",
    errorLocation: "error.js:1:1"
  }],
  ast,
  outputFilePath
})