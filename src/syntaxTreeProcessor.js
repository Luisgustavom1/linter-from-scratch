export class SyntaxTreeProcessor {
  #filePath;
  #errors = new Map();
  #variables = new Map();
  #messages = {
    singleQuote: () => 'use single quotes instead of double quotes',
    useConst: (variableKind) => `use const instead of ${variableKind}`,
    useLet: (variableKind) => `use let instead of ${variableKind}`,
  }
  #stages = {
    declaration: 'declaration',
    expressionDeclaration: 'expressionDeclaration',
  }
  #variableKinds = {
    const: 'const',
    let: 'let',
    var: 'var',
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
      Literal: (n) => this.#handleLiteral(n),
      VariableDeclaration: (n) => this.#handleVariableDeclaration(n),
      ExpressionStatement: (n) => this.#handleExpressionStatement(n),
    }
    hooks[node.type]?.(node);
   
    for (const key in node) {
      const endOfTree = typeof node[key] !== 'object';
      if (endOfTree) continue;
      this.#traverse(node[key]);
    }
  }

  #checkDeclarationsThatNeverChanged() {
    [...this.#variables.values()]
      .filter(({ stage, nodeDeclaration }) => 
        stage === this.#stages.declaration && 
        nodeDeclaration.kind !== this.#variableKinds.const
      )
      .forEach(({ nodeDeclaration }) => {
        this.#storeError(
          this.#messages.useConst(nodeDeclaration.kind),
          nodeDeclaration.loc.start,
        )
        nodeDeclaration.kind = this.#variableKinds.const;
      })
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

  #handleVariableDeclaration(node) {
    const originalKind = node.kind;
    for (const declaration of node.declarations) {
      this.#variables.set(declaration.id.name, {
        stage: this.#stages.declaration,
        nodeDeclaration: node,
        originalKind: originalKind,
      });
    }
  }

  #handleExpressionStatement(node) {
    const { expression } = node;
    if (!expression.left) return;

    const varName = (expression.left.object || expression.left).name;
    if (!this.#variables.has(varName)) return;

    const variable = this.#variables.get(varName);
    const { nodeDeclaration, originalKind, stage } = variable;
    
    // changing an object property from a variable - Ex: object.name = "changed"
    if (stage === this.#stages.declaration && expression.left.type === "MemberExpression") {
      if (this.#variableKinds.const === originalKind) return;

      this.#storeError(
        this.#messages.useConst(originalKind),
        nodeDeclaration.loc.start,
      )
      nodeDeclaration.kind = this.#variableKinds.const;
      this.#variables.set(varName, {
        ...variable,
        stage: this.#stages.expressionDeclaration,
        nodeDeclaration
      });
      return;
    }

    const shouldKeepsDeclarationKind = nodeDeclaration.kind === this.#variableKinds.let || originalKind === this.#variableKinds.let
    if (shouldKeepsDeclarationKind) {
      this.#variables.set(varName, {
        ...variable,
        stage: this.#stages.expressionDeclaration,
        nodeDeclaration,
      })
      return;
    };

    // means reassigned to a different value and using var/const
    this.#storeError(
      this.#messages.useLet(originalKind),
      nodeDeclaration.loc.start,
    )
    nodeDeclaration.kind = this.#variableKinds.let;
    this.#variables.set(varName, {
      ...variable,
      stage: this.#stages.expressionDeclaration,
      nodeDeclaration,
    })
  }

  /**
   * 
   * @param {ASTNode} ast 
   * @returns {Map<string, { message: string, errorLocation: string }>
   */
  process(ast) {
    this.#traverse(ast);
    this.#checkDeclarationsThatNeverChanged();
    return [...this.#errors.values()];
  }
}