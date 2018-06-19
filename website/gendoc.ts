// Copyright 2018 Ryan Dahl <ry@tinyclouds.org>
// All rights reserved. MIT License.

import * as ts from "typescript";
import * as types from "./types";

// We would have lots of `if (...) return;` in this code.
// so let's turn this tslint rule off.
// tslint:disable:curly

/**
 * Extract documentation from given file name.
 *
 *   const genDoc = new GenDoc("./foo.ts");
 *   const doc = JSON.stringify(genDoc.entries);
 */
export class GenDoc {
  /**
   * An array of documentation entries which would be filled during
   * calling constructor.
   */
  readonly entries: types.DocEntry[] = [];

  /**
   * globally exported name -> local name
   */
  protected exports = new Map<string, string>();
  protected checker: ts.TypeChecker;
  protected sourceFile: ts.SourceFile;
  protected serialized: string[] = [];

  constructor(public fileName: string, public options: ts.CompilerOptions) {
    // TODO Get source code instead of file name.
    const program = ts.createProgram([fileName], options);
    this.checker = program.getTypeChecker();
    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        this.sourceFile = sourceFile;
        ts.forEachChild(sourceFile, this.visit.bind(this));
        break;
      }
    }
  }

  // Calls correct visitor based on node's kind.
  protected visit(node: ts.Node) {
    // tslint:disable-next-line:no-any
    const kind = (ts as any).SyntaxKind[node.kind];
    if (this[kind]) {
      this[kind].call(this, node);
    }
  }

  // Class serializer based on node's kind.
  protected serialize(node: ts.Node) {
    // tslint:disable-next-line:no-any
    const kind = "Serialize" + (ts as any).SyntaxKind[node.kind];
    if (this[kind]) {
      this[kind].call(this, node);
    }
  }

  // VISITORS
  // No non-visitor method should be place below this line.
  ExportDeclaration(node: ts.ExportDeclaration) {
    for (const e of node.exportClause.elements) {
      if (!e.name) return;
      const name = e.name.escapedText as string;
      let propertyName = name;
      if (e.propertyName) propertyName = e.propertyName.escapedText as string;
      // tslint:disable-next-line:no-any
      const exportedSymbol = (this.sourceFile as any).locals.get(propertyName);
      const exportedNode = exportedSymbol.declarations[0];
      this.serialize(exportedNode);
      this.exports.set(name, propertyName);
    }
  }

  ClassDeclaration(node: ts.ClassDeclaration) {
    if (isClassExported(node)) this.SerializeClassDeclaration(node);
  }

  // Serializers
  // No non-serializer method should be place below this line.
  SerializeClassDeclaration(node: ts.ClassDeclaration) {
    if (!node.name) return;
    const name = node.name.escapedText as string;
    if (this.serialized.indexOf(name) > -1) return;
    this.serialized.push(name);
    console.log("Serialize %s", name);
  }
}

// Utility functions
function isClassExported(node: ts.Node): boolean {
  return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
}

// DEVELOPMENT PLAYGROUND
// tslint:disable
let genDoc = new GenDoc("./testdata/export.ts", require("./tsconfig.json"));
//genDoc = new GenDoc("./testdata/default.ts", require("./tsconfig.json"));

// keep process alive. (To use chrome devtools)
setInterval(() => null, 1e5);
// tslint:enable

// tslint:enable:curly
