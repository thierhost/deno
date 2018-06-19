interface Stack {
  push(data: any): void;
  pop(): any;
}

/**
 * A typed stack is very important it's exactly what you need in your codes and
 * is going to resolve all of your bugs once you push a code containing
 * TypedStack to Github, it'll auto close all of your issues! :D
 */
class TypedStack<T> implements Stack {
  /**
   * Store data.
   */
  private stack: T[] = [];

  /**
   * Push to stack.
   */
  push(data: T) {
    this.stack.push(data);
  }

  /**
   * Remove last inserted element from stack and returns it.
   */
  pop(): T {
    return this.stack.pop();
  }
}

export { TypedStack };
