import chalk from 'chalk'
import * as astring from 'astring'
import fs from "node:fs"
import path from 'node:path';

export class Reporter {
  /**
   * @param {object} `options` - The options object
   * @param {Map<string, { message: string, errorLocation: string }>} `options.errors` - A map of errors with their location 
   * @param {ASTNode} `options.ast` The "Program" AST node.
   * @param {string} `options.outputFilePath` The output file path.
   */
  static report({ errors, ast, outputFilePath }) {
    errors.forEach(({ message, errorLocation }) => {
      const errorMessage = `${chalk.red('Error:')} ${message}`;
      const finalMessage = `${errorMessage}\n${chalk.gray(errorLocation)}`
      console.error(finalMessage);
      const updatedCode = astring.generate(ast);  
      fs.writeFileSync(outputFilePath, updatedCode, "utf-8");
    })

    if (!errors.size) {
      console.log(chalk.green('Linting completed without errors'))
    } else {
      console.log(chalk.red(`Linting completed with ${errors.size} error(s)`))
    }

    console.log(
      chalk.green('\nCode fixed and saved at'),
      chalk.yellow('./' + path.basename(outputFilePath)),
      chalk.green("successfully!")
    )
  }
}