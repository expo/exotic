class Node {
  constructor(nodeName) {
    this.nodeName = nodeName;
  }

  get ownerDocument() {
    return window.document;
  }

  appendChild(element) {
    // unimplemented
  }
  removeChild() {}
}

export default Node;
