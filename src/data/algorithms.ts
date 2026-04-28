import type { Algorithm } from '@/types';

export const algorithms: Algorithm[] = [
  // Searching Algorithms
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    description: 'Linear Search sequentially checks each element of the list until the target element is found or the list ends.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Element found at index i
    }
  }
  return -1; // Element not found
}`
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    description: 'Binary Search finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Element found
    } else if (arr[mid] < target) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }
  return -1; // Element not found
}`
  },

  // Sorting Algorithms
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    description: 'Selection Sort divides the array into a sorted and unsorted part, repeatedly selecting the minimum element from the unsorted part.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function selectionSort(arr, order = "asc") {
  const compare = order === "asc" 
    ? (x, y) => x < y 
    : (x, y) => x > y;
  let n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (compare(arr[j], arr[minIdx])) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    description: 'Insertion Sort builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into the correct position.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    description: 'Merge Sort divides the array into halves, sorts them recursively, and then merges the sorted halves.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}`
  },
  {
    id: 'radix-sort',
    name: 'Radix Sort',
    category: 'sorting',
    description: 'Radix Sort is a non-comparative sorting algorithm that sorts data by processing individual digits. It sorts the input numbers digit by digit, starting from the least significant digit.',
    timeComplexity: 'O(nk)',
    spaceComplexity: 'O(n+k)',
    code: `function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortForRadix(arr, exp);
  }
  return arr;
}

function countingSortForRadix(arr, exp) {
  const n = arr.length;
  const output = new Array(n);
  const count = new Array(10).fill(0);
  
  for (let i = 0; i < n; i++) {
    count[Math.floor(arr[i] / exp) % 10]++;
  }
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
  }
}`
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    description: 'Quick Sort is a divide-and-conquer algorithm that picks an element as a pivot and partitions the given array around the picked pivot.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    let pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  let pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`
  },


  // Stack Operations
  {
    id: 'stack-operations',
    name: 'Stack (Insertion/Deletion)',
    category: 'stack',
    description: 'Stack is a LIFO (Last In First Out) data structure. Push adds elements to the top, Pop removes from the top.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    code: `class Stack {
  constructor() {
    this.items = [];
  }
  
  push(element) {
    this.items.push(element);
  }
  
  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }
  
  peek() {
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
}`
  },
  {
    id: 'polish-notation',
    name: 'Polish Notation',
    category: 'stack',
    description: 'Polish Notation (Prefix) places operators before their operands. Example: + 3 4 = 7. The operator is written before its operands, making it easy to evaluate without parentheses.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `function evaluatePrefix(expression) {
  const stack = [];
  const tokens = expression.split(' ').reverse();
  
  for (let token of tokens) {
    if (isOperator(token)) {
      const a = stack.pop();
      const b = stack.pop();
      stack.push(operate(token, a, b));
    } else {
      stack.push(parseInt(token));
    }
  }
  return stack.pop();
}

function isOperator(c) {
  return ['+', '-', '*', '/'].includes(c);
}

function operate(op, a, b) {
  switch(op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
  }
}`
  },
  {
    id: 'reverse-polish',
    name: 'Reverse Polish Notation',
    category: 'stack',
    description: 'Reverse Polish Notation (Postfix) places operators after their operands. Example: 3 4 + = 7. Eliminates the need for parentheses and is used in calculators and compilers.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `function evaluatePostfix(expression) {
  const stack = [];
  const tokens = expression.split(' ');
  
  for (let token of tokens) {
    if (isOperator(token)) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(operate(token, a, b));
    } else {
      stack.push(parseInt(token));
    }
  }
  return stack.pop();
}

function isOperator(c) {
  return ['+', '-', '*', '/'].includes(c);
}

function operate(op, a, b) {
  switch(op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
  }
}`
  },
  {
    id: 'evaluation',
    name: 'Evaluation',
    category: 'stack',
    description: 'Expression evaluation using a stack converts infix expressions (e.g. 3 + 4 * 2) to postfix and evaluates them. The stack manages operator precedence and parentheses.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `function infixToPostfix(expression) {
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const stack = [];
  let output = '';

  for (let ch of expression) {
    if (!isNaN(ch) && ch !== ' ') {
      output += ch;
    } else if (ch === '(') {
      stack.push(ch);
    } else if (ch === ')') {
      while (stack.length && stack[stack.length-1] !== '(') {
        output += ' ' + stack.pop();
      }
      stack.pop();
    } else if (ch in precedence) {
      while (stack.length && precedence[stack[stack.length-1]] >= precedence[ch]) {
        output += ' ' + stack.pop();
      }
      stack.push(ch);
    }
  }
  while (stack.length) output += ' ' + stack.pop();
  return output;
}`
  },


  // Queue Operations

  {
    id: 'queue-operations',
    name: 'Queue (Insertion and Deletion)',
    category: 'queue',
    description: 'Queue is a FIFO (First In First Out) data structure. Enqueue adds to the rear, Dequeue removes from the front.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    code: `class Queue {
  constructor() {
    this.items = [];
  }
  
  enqueue(element) {
    this.items.push(element);
  }
  
  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }
  
  front() {
    return this.items[0];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
}`
  },
  {
    id: 'circular-queue',
    name: 'Circular Queue',
    category: 'queue',
    description: 'Circular Queue uses a fixed-size array where the rear pointer wraps back to the front when it reaches the end, forming a ring. This avoids wasted space after dequeue operations.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    code: `class CircularQueue {
  constructor(size) {
    this.items = new Array(size);
    this.front = -1;
    this.rear = -1;
    this.size = size;
  }

  enqueue(element) {
    if (this.isFull()) return false;
    if (this.front === -1) this.front = 0;
    this.rear = (this.rear + 1) % this.size; // wrap around
    this.items[this.rear] = element;
    return true;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const item = this.items[this.front];
    if (this.front === this.rear) {
      this.front = -1; // queue now empty
      this.rear = -1;
    } else {
      this.front = (this.front + 1) % this.size; // wrap around
    }
    return item;
  }

  isFull() { return (this.rear + 1) % this.size === this.front; }
  isEmpty() { return this.front === -1; }
}`
  },

  // Linked List

  {
    id: 'linked-list',
    name: 'Linked List',
    category: 'linkedlist',
    description: 'Linked List is a linear data structure where elements are stored in nodes, each containing data and a reference to the next node.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }
  
  insert(data) {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }
  
  delete(data) {
    if (!this.head) return;
    if (this.head.data === data) {
      this.head = this.head.next;
      return;
    }
    let current = this.head;
    while (current.next && current.next.data !== data) {
      current = current.next;
    }
    if (current.next) {
      current.next = current.next.next;
    }
  }
  
  search(data) {
    let current = this.head;
    while (current) {
      if (current.data === data) return true;
      current = current.next;
    }
    return false;
  }
}`
  },
  {
    id: 'doubly-linked-list',
    name: 'Doubly Linked List',
    category: 'linkedlist',
    description: 'Doubly Linked List has nodes with references to both next and previous nodes, allowing bidirectional traversal.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `class DNode {
  constructor(data) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }
  
  insert(data) {
    const newNode = new DNode(data);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      return;
    }
    this.tail.next = newNode;
    newNode.prev = this.tail;
    this.tail = newNode;
  }
  
  delete(data) {
    let current = this.head;
    while (current) {
      if (current.data === data) {
        if (current.prev) current.prev.next = current.next;
        if (current.next) current.next.prev = current.prev;
        if (current === this.head) this.head = current.next;
        if (current === this.tail) this.tail = current.prev;
        return;
      }
      current = current.next;
    }
  }
}`
  },

  // Hash Functions

  {
    id: 'hash-open',
    name: 'Open Hashing (Separate Chaining)',
    category: 'hash',
    description: 'Open Hashing handles collisions by storing multiple items in the same slot using a linked list.',
    timeComplexity: 'O(1) avg, O(n) worst',
    spaceComplexity: 'O(n)',
    code: `class HashTable {
  constructor(size = 10) {
    this.size = size;
    this.table = new Array(size).fill(null).map(() => []);
  }
  
  hash(key) {
    let hash = 0;
    for (let char of key) {
      hash += char.charCodeAt(0);
    }
    return hash % this.size;
  }
  
  insert(key, value) {
    const index = this.hash(key);
    const bucket = this.table[index];
    const existing = bucket.find(item => item.key === key);
    if (existing) {
      existing.value = value;
    } else {
      bucket.push({ key, value });
    }
  }
  
  get(key) {
    const index = this.hash(key);
    const bucket = this.table[index];
    const item = bucket.find(item => item.key === key);
    return item ? item.value : undefined;
  }
}`
  },
  {
    id: 'hash-closed',
    name: 'Closed Hashing (Open Addressing)',
    category: 'hash',
    description: 'Closed Hashing handles collisions by finding the next available slot in the table using probing.',
    timeComplexity: 'O(1) avg, O(n) worst',
    spaceComplexity: 'O(n)',
    code: `class ClosedHashTable {
  constructor(size = 10) {
    this.size = size;
    this.table = new Array(size).fill(null);
  }
  
  hash(key) {
    let hash = 0;
    for (let char of key) {
      hash += char.charCodeAt(0);
    }
    return hash % this.size;
  }
  
  insert(key, value) {
    let index = this.hash(key);
    let i = 0;
    while (this.table[index] !== null && this.table[index].key !== key) {
      i++;
      index = (this.hash(key) + i) % this.size; // Linear probing
    }
    this.table[index] = { key, value };
  }
  
  get(key) {
    let index = this.hash(key);
    let i = 0;
    while (this.table[index] !== null) {
      if (this.table[index].key === key) {
        return this.table[index].value;
      }
      i++;
      index = (this.hash(key) + i) % this.size;
      if (i >= this.size) break;
    }
    return undefined;
  }
}`
  },

  // Tree

  {
    id: 'bst',
    name: 'Binary Search Tree',
    category: 'tree',
    description: 'A Binary Search Tree (BST) stores values such that every left child is smaller and every right child is larger than the parent. Supports efficient Traversal (In/Pre/Post), Insertion, Deletion, and Search.',
    timeComplexity: 'O(log n) avg, O(n) worst',
    spaceComplexity: 'O(n)',
    code: `class BST {
  insert(root, value) {
    if (!root) return new Node(value);
    if (value < root.value)
      root.left = this.insert(root.left, value);
    else if (value > root.value)
      root.right = this.insert(root.right, value);
    return root;
  }

  delete(root, value) {
    if (!root) return null;
    if (value < root.value)
      root.left = this.delete(root.left, value);
    else if (value > root.value)
      root.right = this.delete(root.right, value);
    else {
      if (!root.left) return root.right;
      if (!root.right) return root.left;
      // Replace with in-order successor
      let min = root.right;
      while (min.left) min = min.left;
      root.value = min.value;
      root.right = this.delete(root.right, min.value);
    }
    return root;
  }

  inorder(root, result = []) {
    if (!root) return result;
    this.inorder(root.left, result);
    result.push(root.value);
    this.inorder(root.right, result);
    return result;
  }
}`
  },
  {
    id: 'avl-tree',
    name: 'AVL Tree',
    category: 'tree',
    description: 'An AVL Tree is a self-balancing BST where the height difference (balance factor) between left and right subtrees is at most 1. It performs rotations (LL, RR, LR, RL) after insertions and deletions to restore balance.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(n)',
    code: `function height(node) {
  return node ? node.height : 0;
}
function balanceFactor(node) {
  return node ? height(node.left) - height(node.right) : 0;
}
function updateHeight(node) {
  node.height = 1 + Math.max(height(node.left), height(node.right));
}

function rotateRight(y) {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  updateHeight(y);
  updateHeight(x);
  return x; // new root
}
function rotateLeft(x) {
  const y = x.right;
  x.right = y.left;
  y.left = x;
  updateHeight(x);
  updateHeight(y);
  return y; // new root
}

function insert(root, value) {
  if (!root) return { value, left: null, right: null, height: 1 };
  if (value < root.value) root.left = insert(root.left, value);
  else root.right = insert(root.right, value);
  updateHeight(root);

  const bf = balanceFactor(root);
  if (bf > 1 && value < root.left.value)  return rotateRight(root);  // LL
  if (bf < -1 && value > root.right.value) return rotateLeft(root);   // RR
  if (bf > 1 && value > root.left.value) {                            // LR
    root.left = rotateLeft(root.left);
    return rotateRight(root);
  }
  if (bf < -1 && value < root.right.value) {                          // RL
    root.right = rotateRight(root.right);
    return rotateLeft(root);
  }
  return root;
}`
  },
  {
    id: 'red-black-tree',
    name: 'Red-Black Tree',
    category: 'tree',
    description: 'A Red-Black Tree is a self-balancing BST where each node is colored red or black. It maintains balance through 5 properties: root is black, red nodes have black children, all paths from a node to null have the same black-height, etc.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(n)',
    code: `// Red-Black Tree Properties:
// 1. Every node is Red or Black
// 2. Root is always Black
// 3. Red node's children must be Black (no two reds in a row)
// 4. Every path from root to null has same Black-height

function insertRB(root, value) {
  root = bstInsert(root, value, 'red');
  root = fixViolations(root, value);
  root.color = 'black'; // root always black
  return root;
}

function fixViolations(root, value) {
  // Case 1: Uncle is red → Recolor
  // Case 2: Uncle is black, node is inner child → Rotate parent
  // Case 3: Uncle is black, node is outer child → Rotate grandparent + recolor
  // (full implementation uses parent pointers or recursive fix)
  return rebalance(root);
}

function rebalance(node) {
  if (!node) return node;
  node.left = rebalance(node.left);
  node.right = rebalance(node.right);
  
  // Fix right-leaning red link
  if (isRed(node.right) && !isRed(node.left))
    node = rotateLeft(node);
  // Fix two consecutive red links
  if (isRed(node.left) && isRed(node.left?.left))
    node = rotateRight(node);
  // Split 4-node
  if (isRed(node.left) && isRed(node.right))
    flipColors(node);
  return node;
}

function isRed(node) {
  return node?.color === 'red';
}`
  },

  // Graph

  {
    id: 'graph-representation',
    name: 'Graph Representation',
    category: 'graph',
    description: 'Graphs can be represented as an Adjacency Matrix (2D array where matrix[i][j] = weight) or an Adjacency List (array of lists where each index holds its neighbors). Matrix is O(V²) space; List is O(V+E) space.',
    timeComplexity: 'O(V²) matrix / O(V+E) list',
    spaceComplexity: 'O(V²) / O(V+E)',
    code: `// Adjacency Matrix (weighted undirected graph)
const matrix = [
  //  A  B  C  D  E
  [   0, 4, 0, 0, 8 ],  // A
  [   4, 0, 8, 0, 11],  // B
  [   0, 8, 0, 7, 0 ],  // C
  [   0, 0, 7, 0, 9 ],  // D
  [   8, 11,0, 9, 0 ],  // E
];

// Adjacency List (same graph)
const adjList = {
  A: [{ node: 'B', w: 4 }, { node: 'E', w: 8 }],
  B: [{ node: 'A', w: 4 }, { node: 'C', w: 8 }, { node: 'E', w: 11 }],
  C: [{ node: 'B', w: 8 }, { node: 'D', w: 7 }],
  D: [{ node: 'C', w: 7 }, { node: 'E', w: 9 }],
  E: [{ node: 'A', w: 8 }, { node: 'B', w: 11 }, { node: 'D', w: 9 }],
};`
  },
  {
    id: 'dfs',
    name: 'Depth First Search',
    category: 'graph',
    description: 'DFS explores as far as possible along each branch before backtracking. Uses a stack (or recursion). Time: O(V+E). Used for cycle detection, topological sort, path finding.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    code: `function dfs(graph, start) {
  const visited = new Set();
  const order = [];

  function explore(node) {
    if (visited.has(node)) return;
    visited.add(node);
    order.push(node);

    for (const neighbor of graph[node]) {
      explore(neighbor.node);
    }
  }

  explore(start);
  return order; // visit order
}

// Iterative version using explicit stack
function dfsIterative(graph, start) {
  const visited = new Set();
  const stack = [start];
  const order = [];

  while (stack.length > 0) {
    const node = stack.pop();
    if (!visited.has(node)) {
      visited.add(node);
      order.push(node);
      for (const neighbor of graph[node].reverse()) {
        if (!visited.has(neighbor.node)) {
          stack.push(neighbor.node);
        }
      }
    }
  }
  return order;
}`
  },
  {
    id: 'bfs',
    name: 'Breadth First Search',
    category: 'graph',
    description: 'BFS explores all neighbors at the current depth before moving deeper. Uses a queue. Time: O(V+E). Finds shortest path in unweighted graphs, level-order traversal.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    code: `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];

  while (queue.length > 0) {
    const node = queue.shift(); // dequeue from front
    order.push(node);

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node);
        queue.push(neighbor.node);
      }
    }
  }

  return order; // level-by-level visit order
}

// BFS also finds shortest path in unweighted graphs:
function shortestPath(graph, start, end) {
  const prev = {};
  bfs(graph, start, prev);
  const path = [];
  let curr = end;
  while (curr !== undefined) {
    path.unshift(curr);
    curr = prev[curr];
  }
  return path;
}`
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'graph',
    description: "Dijkstra's finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edges. Uses a min-priority queue. Greedy algorithm.",
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    code: `function dijkstra(graph, source) {
  const dist = {};
  const visited = new Set();
  const prev = {};

  // Initialize distances to Infinity
  for (const node of Object.keys(graph)) {
    dist[node] = Infinity;
  }
  dist[source] = 0;

  // Simple priority queue (min-heap)
  const pq = [{ node: source, dist: 0 }];

  while (pq.length > 0) {
    // Extract node with minimum distance
    pq.sort((a, b) => a.dist - b.dist);
    const { node } = pq.shift();

    if (visited.has(node)) continue;
    visited.add(node);

    for (const { node: neighbor, w } of graph[node]) {
      const newDist = dist[node] + w;
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        prev[neighbor] = node;
        pq.push({ node: neighbor, dist: newDist });
      }
    }
  }

  return { dist, prev };
}`
  },
  {
    id: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    category: 'graph',
    description: 'Bellman-Ford finds shortest paths from a source to all vertices, handling negative-weight edges. It relaxes all edges V-1 times. Can detect negative-weight cycles.',
    timeComplexity: 'O(V × E)',
    spaceComplexity: 'O(V)',
    code: `function bellmanFord(vertices, edges, source) {
  const dist = {};
  for (const v of vertices) dist[v] = Infinity;
  dist[source] = 0;

  // Relax all edges V-1 times
  for (let i = 0; i < vertices.length - 1; i++) {
    for (const { from, to, weight } of edges) {
      if (dist[from] !== Infinity &&
          dist[from] + weight < dist[to]) {
        dist[to] = dist[from] + weight;
      }
    }
  }

  // Check for negative-weight cycles
  for (const { from, to, weight } of edges) {
    if (dist[from] !== Infinity &&
        dist[from] + weight < dist[to]) {
      console.log('Negative cycle detected!');
      return null;
    }
  }

  return dist;
}`
  },
  {
    id: 'floyd-warshall',
    name: 'Floyd-Warshall Algorithm',
    category: 'graph',
    description: "Floyd-Warshall finds shortest paths between ALL pairs of vertices. Uses dynamic programming with a V×V distance matrix. Works with negative edges (but not negative cycles).",
    timeComplexity: 'O(V³)',
    spaceComplexity: 'O(V²)',
    code: `function floydWarshall(graph, V) {
  // dist[i][j] = shortest distance from i to j
  const dist = graph.map(row => [...row]);

  // Set diagonal to 0
  for (let i = 0; i < V; i++) dist[i][i] = 0;

  // Try every vertex k as intermediate point
  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  // dist[i][j] now holds shortest path from i to j
  return dist;
}

// Initial graph (INF = no direct edge):
// const INF = Infinity;
// const graph = [
//   [0,   4, INF, INF,  8],
//   [4,   0,   8, INF, 11],
//   [INF, 8,   0,   7, INF],
//   [INF,INF,  7,   0,   9],
//   [8,  11, INF,   9,   0],
// ];`
  },

];

export const categories = [
  { id: 'searching', name: 'Searching', icon: 'Search' },
  { id: 'sorting', name: 'Sorting', icon: 'ArrowUpDown' },
  { id: 'stack', name: 'Stack', icon: 'Layers' },
  { id: 'queue', name: 'Queue', icon: 'List' },
  { id: 'linkedlist', name: 'Linked List', icon: 'Link' },
  { id: 'hash', name: 'Hash Function', icon: 'Hash' },
  { id: 'tree', name: 'Tree', icon: 'GitBranch' },
  { id: 'graph', name: 'Graph', icon: 'Network' },
];

export const getAlgorithmsByCategory = (categoryId: string) => {
  return algorithms.filter(alg => alg.category === categoryId);
};

export const getAlgorithmById = (id: string) => {
  return algorithms.find(alg => alg.id === id);
};
