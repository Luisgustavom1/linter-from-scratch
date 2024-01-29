export class SyntaxTreeProcessor {
  #filePath;
  #errors = new Map();
  #messages = {
    singleQuote: () => 'use single quotes instead of double quotes',
  }

  constructor(filePath) {
    this.#filePath = filePath;
  }

  #storeError(message, { line, column }) {
    const errorLocation = `${this.#filePath}:${line}:${column + 1}`;
    this.#errors.set(errorLocation, { message, errorLocation });
  }
  
  #traverse(node) {
    if (!node) return;
    
    const hooks = {
      Literal: (n) => this.#handleLiteral(n)
    }
    hooks[node.type]?.(node);
   
    for (const key in node) {
      const endOfTree = typeof node[key] !== 'object';
      if (endOfTree) continue;
      this.#traverse(node[key]);
    }
  }

  #handleLiteral(node) {
    if (!(node.raw && typeof node.raw === 'string')) return;

    if(!node.raw.includes('"')) return;
    node.raw = node.raw.replace(/"/g, "'");

    this.#storeError(
      this.#messages.singleQuote(),
      node.loc.start,
    );
  }

  /**
   * 
   * @param {ASTNode} ast 
   * @returns {Map<string, { message: string, errorLocation: string }>
   */
  process(ast) {
    this.#traverse(ast);
    return this.#errors;
  }
}