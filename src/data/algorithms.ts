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
  {
    id: 'recursion',
    name: 'Recursion',
    category: 'stack',
    description: 'Recursion is a technique where a function calls itself to solve smaller sub-problems. The call stack keeps track of each function call. Base cases stop the recursion.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) — call stack depth',
    code: `// Factorial using recursion
function factorial(n) {
  if (n <= 1) return 1;      // base case
  return n * factorial(n - 1);
}

// Fibonacci using recursion
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Tower of Hanoi
function hanoi(n, from, to, via) {
  if (n === 0) return;
  hanoi(n - 1, from, via, to);
  console.log(\`Move disk \${n} from \${from} to \${to}\`);
  hanoi(n - 1, via, to, from);
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

];

export const categories = [
  { id: 'searching', name: 'Searching', icon: 'Search' },
  { id: 'sorting', name: 'Sorting', icon: 'ArrowUpDown' },
  { id: 'stack', name: 'Stack', icon: 'Layers' },
  { id: 'queue', name: 'Queue', icon: 'List' },
  { id: 'linkedlist', name: 'Linked List', icon: 'Link' },
  { id: 'hash', name: 'Hash Function', icon: 'Hash' },
];

export const getAlgorithmsByCategory = (categoryId: string) => {
  return algorithms.filter(alg => alg.category === categoryId);
};

export const getAlgorithmById = (id: string) => {
  return algorithms.find(alg => alg.id === id);
};
