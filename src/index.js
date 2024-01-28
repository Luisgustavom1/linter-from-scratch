import { parseArgs } from "node:util"
import chalk from 'chalk';

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
  }
}

const filePath = getFilePathFromCLI();
console.log(filePath); 