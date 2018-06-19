/**
 * Some values representing basic mathematical operations.
 */
export const enum Operator {
  ADD,
  DIV,
  MUL,
  SUB
}

/**
 * Computes result of operation based on given enum.
 */
export function compute(op: Operator, a: number, b: number): number {
  if (op === Operator.ADD || op === Operator.SUB) {
    if (op === Operator.SUB) b = -b;
    return a + b;
  } else if (op === Operator.MUL || op === Operator.DIV) {
    if (op === Operator.DIV) b = 1 / b;
    return a * b;
  }
  throw Error("Something bad happend!");
}

// Just to test doc generator.
export { Operator as OP };
