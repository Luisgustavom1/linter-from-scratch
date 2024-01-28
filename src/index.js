#!/usr/bin/env node
import { parseArgs } from "node:util"
import fs from "node:fs"
import chalk from 'chalk';
import * as espree from "espree"

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
const code = fs.readFileSync(filePath, 'utf-8');
const ast = espree.parse(code, { 
  ecmaVersion: 2020,
  loc: true,
  sourceType: 'module'
});

console.log(JSON.stringify(ast, null, 2))