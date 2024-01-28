import chalk from 'chalk'
import * as astring from 'astring'
import fs from "node:fs"
import path from 'node:path';

export class Reporter {
  static report({ errors, ast, outputFilePath }) {
    errors.forEach(({ message, errorLocation }) => {
      const errorMessage = `${chalk.red('Error:')} ${message}`;
      const finalMessage = `${errorMessage}\n${chalk.gray(errorLocation)}`
      console.error(finalMessage);
      const updatedCode = astring.generate(ast);  
      fs.writeFileSync(outputFilePath, updatedCode, "utf-8");

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
    })
  }
}