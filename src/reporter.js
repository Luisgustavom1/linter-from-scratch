import chalk from 'chalk'
import * as astring from 'astring'
import fs from "node:fs"
import path from 'node:path';

export class Reporter {
  /**
   * @param {object} `options` - The options object
   * @param {Array.<{ message: string, errorLocation: string }>} `options.errors` - A map of errors with their location 
   * @param {ASTNode} `options.ast` The "Program" AST node.
   * @param {string} `options.outputFilePath` The output file path.
   */
  static report({ errors, ast, outputFilePath }) {
    errors
      .sort((error1, error2) => {
        // error.js:6:26
        const [line1, column1] = error1.errorLocation.split(':').slice(1);
        const [line2, column2] = error2.errorLocation.split(':').slice(1);
        if (line1 !== line2) return line1 - line2;
        return column1 - column2;
      })
      .forEach(({ message, errorLocation }) => {
      const errorMessage = `${chalk.red('Error:')} ${message}`;
      const finalMessage = `${errorMessage}\n${chalk.gray(errorLocation)}`
      console.error(finalMessage);
      const updatedCode = astring.generate(ast);  
      fs.writeFileSync(outputFilePath, updatedCode, "utf-8");
    })

    if (!errors.length) {
      console.log(chalk.green('Linting completed without errors'))
    } else {
      console.log(chalk.red(`Linting completed with ${errors.length} error(s)`))
    }

    console.log(
      chalk.green('\nCode fixed and saved at'),
      chalk.yellow('./' + path.basename(outputFilePath)),
      chalk.green("successfully!")
    )
  }
}