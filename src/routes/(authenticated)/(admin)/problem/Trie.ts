class TrieNode<TNodeVal> {
  children: Map<string, TrieNode<TNodeVal>>;
  value: TNodeVal | null;
  isEndOfWord: boolean;

  constructor() {
    this.children = new Map();
    this.value = null;
    this.isEndOfWord = false;
  }
}

export class Trie<TNodeVal> {
  private root: TrieNode<TNodeVal>;

  constructor(entries?: Array<{ key: string; val: TNodeVal }>) {
    this.root = new TrieNode<TNodeVal>();
    
    if (entries) {
      for (const entry of entries) {
        this.add(entry.key, entry.val);
      }
    }
  }

  add(key: string, val: TNodeVal): void {
    let node = this.root;

    for (const char of key) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode<TNodeVal>());
      }
      node = node.children.get(char)!;
    }

    node.isEndOfWord = true;
    node.value = val;
  }

  get(key: string): TNodeVal | null {
    let node = this.root;

    for (const char of key) {
      if (!node.children.has(char)) {
        return null;
      }
      node = node.children.get(char)!;
    }

    return node.isEndOfWord ? node.value : null;
  }

  getAllSubtreeValues(prefix: string = ""): TNodeVal[] {
    let node = this.root;

    for (const char of prefix) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }

    const values: TNodeVal[] = [];
    this.collectValues(node, values);
    return values;
  }

  private collectValues(node: TrieNode<TNodeVal>, values: TNodeVal[]): void {
    if (node.isEndOfWord && node.value !== null) {
      values.push(node.value);
    }

    for (const child of node.children.values()) {
      this.collectValues(child, values);
    }
  }
}