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
   * We iterate source code twice, this number represent which step
   * we're currently in (one or two)
   */
  protected round = 1;

  /**
   * Array of used identifiers, filled in first iteration.
   * Used to detect if we should put something in documentation or not.
   * (ex: We fill it with export property names, so we can figure out if a
   *  class, function, etc is exported.)
   */
  protected identifiers: string[] = [];

  /**
   * globally exported name -> local name
   */
  protected exports = new Map<string, string>();
  protected checker: ts.TypeChecker;

  constructor(public fileName: string, public options: ts.CompilerOptions) {
    // TODO Get source code instead of file name.
    const program = ts.createProgram([fileName], options);
    this.checker = program.getTypeChecker();
    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        // Each documentation must contain all of the exported data
        // including classes, functions, etc.
        // Regarding that we should iterate over source file nodes twice.
        //
        // First we should find out what should be placed inside the doc.
        // GenDoc.identifiers is an array of identifiers we should look for
        // in next step, so just push to this.identifiers for now.
        ts.forEachChild(sourceFile, this.visit.bind(this));
        this.round += 1; // == 2
        // At last, we visit all the nodes for one more time and now
        // it's time to push data to GenDoc.entries.
        ts.forEachChild(sourceFile, this.visit.bind(this));
      }
    }
  }

  // Call correct visitor based on node's kind.
  protected visit(node: ts.Node) {
    // tslint:disable-next-line:no-any
    const kind = (ts as any).SyntaxKind[node.kind];
    if (this.round > 1) return;
    if (this[kind]) {
      this[kind].call(this, node);
    }
  }

  // VISITORS
  // No non-visitor method should be place below this line.
  ExportDeclaration(node: ts.ExportDeclaration) {
    if (this.round > 1) return;
    for (const e of node.exportClause.elements) {
      if (!e.name) return;
      const name = e.name.escapedText as string;
      let propertyName = name;
      if (e.propertyName) propertyName = e.propertyName.escapedText as string;
      if (this.identifiers.indexOf(propertyName) < 0) {
        this.identifiers.push(propertyName);
      }
      this.exports.set(name, propertyName);
    }
  }
}

// DEVELOPMENT PLAYGROUND
// tslint:disable
let genDoc = new GenDoc("./testdata/export.ts", require("./tsconfig.json"));
//genDoc = new GenDoc("./testdata/default.ts", require("./tsconfig.json"));

// keep process alive. (To use chrome devtools)
setInterval(() => null, 1e5);
// tslint:enable

// tslint:enable:curly
