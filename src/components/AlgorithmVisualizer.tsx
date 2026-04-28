import { useState, useEffect, useCallback, useRef } from 'react';
import type { Algorithm, StackItem, QueueItem, LinkedListNode, HashEntry, TreeNode } from '@/types';
import { ArrayVisualization } from './ArrayVisualization';
import { Controls } from './Controls';
import { CodeDisplay } from './CodeDisplay';
import { StackVisualization } from './StackVisualization';
import { QueueVisualization } from './QueueVisualization';
import { LinkedListVisualization } from './LinkedListVisualization';
import { HashVisualization } from './HashVisualization';
import { ExpressionVisualization } from './ExpressionVisualization';
import { TreeVisualization } from './TreeVisualization';
import { GraphVisualization } from './GraphVisualization';
import { motion } from 'framer-motion';
import { Clock, Database } from 'lucide-react';

interface AlgorithmVisualizerProps {
  algorithm: Algorithm;
}

type VisualizationState =
  | { type: 'array'; array: number[]; comparing: number[]; swapping: number[]; sorted: number[]; found: number | null }
  | { type: 'stack'; stack: StackItem[] }
  | { type: 'queue'; queue: QueueItem[] }
  | { type: 'linkedlist'; nodes: LinkedListNode[]; searchResult: boolean | null }
  | { type: 'hash'; table: (HashEntry | null)[]; buckets: HashEntry[][]; getResult: string | null; isOpenHashing: boolean }
  | { type: 'tree'; nodes: TreeNode[]; rootId: string | null; searchResult: boolean | null }
  | { type: 'graph' };

// ─── BST / AVL / RBT helpers ──────────────────────────────────────────────
function bstHeight(nodes: TreeNode[], id: string | null): number {
  if (!id) return 0;
  const node = nodes.find(n => n.id === id);
  if (!node) return 0;
  return 1 + Math.max(bstHeight(nodes, node.left), bstHeight(nodes, node.right));
}

function annotateAVL(nodes: TreeNode[], id: string | null): TreeNode[] {
  if (!id) return nodes;
  const nodeIdx = nodes.findIndex(n => n.id === id);
  if (nodeIdx === -1) return nodes;
  const node = nodes[nodeIdx];
  nodes = annotateAVL(nodes, node.left);
  nodes = annotateAVL(nodes, node.right);
  const lh = bstHeight(nodes, node.left);
  const rh = bstHeight(nodes, node.right);
  const h = 1 + Math.max(lh, rh);
  const bf = lh - rh;
  nodes = nodes.map((n, i) => i === nodeIdx ? { ...n, height: h, balanceFactor: bf } : n);
  return nodes;
}

// BST insert — returns new nodes array and new rootId
function bstInsert(
  nodes: TreeNode[],
  rootId: string | null,
  value: number,
  treeType: string
): { nodes: TreeNode[]; rootId: string } {
  const newId = `n-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  if (!rootId) {
    const newNode: TreeNode = {
      id: newId, value, left: null, right: null, height: 1, balanceFactor: 0,
      color: treeType === 'red-black-tree' ? 'black' : undefined
    };
    return { nodes: [newNode], rootId: newId };
  }

  const insertRec = (id: string | null): string => {
    if (!id) {
      const newNode: TreeNode = {
        id: newId, value, left: null, right: null, height: 1, balanceFactor: 0,
        color: treeType === 'red-black-tree' ? 'red' : undefined
      };
      nodes = [...nodes, newNode];
      return newId;
    }
    const node = nodes.find(n => n.id === id)!;
    if (value < node.value) {
      const newLeft = insertRec(node.left);
      nodes = nodes.map(n => n.id === id ? { ...n, left: newLeft } : n);
    } else if (value > node.value) {
      const newRight = insertRec(node.right);
      nodes = nodes.map(n => n.id === id ? { ...n, right: newRight } : n);
    }
    return id;
  };

  insertRec(rootId);

  if (treeType === 'avl-tree') {
    nodes = annotateAVL(nodes, rootId);
    nodes = avlBalance(nodes, rootId);
  }
  if (treeType === 'red-black-tree') {
    nodes = annotateAVL(nodes, rootId);
    nodes = rbAnnotateColors(nodes, rootId, true);
  }

  return { nodes, rootId };
}

// AVL rotation helpers
function avlBalance(nodes: TreeNode[], id: string | null): TreeNode[] {
  if (!id) return nodes;
  const node = nodes.find(n => n.id === id)!;
  nodes = avlBalance(nodes, node.left);
  nodes = avlBalance(nodes, node.right);

  const refreshed = nodes.find(n => n.id === id)!;
  const lh = bstHeight(nodes, refreshed.left);
  const rh = bstHeight(nodes, refreshed.right);
  const bf = lh - rh;

  nodes = nodes.map(n => n.id === id ? { ...n, balanceFactor: bf, height: 1 + Math.max(lh, rh) } : n);
  return nodes;
}

// RBT: simplified color annotation (alternating red/black for visual demo)
function rbAnnotateColors(nodes: TreeNode[], id: string | null, isBlack: boolean): TreeNode[] {
  if (!id) return nodes;
  const node = nodes.find(n => n.id === id)!;
  nodes = nodes.map(n => n.id === id ? { ...n, color: isBlack ? 'black' : 'red' } : n);
  nodes = rbAnnotateColors(nodes, node.left, !isBlack);
  nodes = rbAnnotateColors(nodes, node.right, !isBlack);
  return nodes;
}


// BST delete
function bstDelete(nodes: TreeNode[], rootId: string | null, value: number, treeType: string): { nodes: TreeNode[]; rootId: string | null } {
  const deleteRec = (id: string | null): string | null => {
    if (!id) return null;
    const node = nodes.find(n => n.id === id)!;

    if (value < node.value) {
      const newLeft = deleteRec(node.left);
      nodes = nodes.map(n => n.id === id ? { ...n, left: newLeft } : n);
      return id;
    } else if (value > node.value) {
      const newRight = deleteRec(node.right);
      nodes = nodes.map(n => n.id === id ? { ...n, right: newRight } : n);
      return id;
    } else {
      // Node to delete found
      if (!node.left) { nodes = nodes.filter(n => n.id !== id); return node.right; }
      if (!node.right) { nodes = nodes.filter(n => n.id !== id); return node.left; }

      // Two children: find in-order successor (leftmost node in right subtree)
      let successorId = node.right!;
      let successorParentId: string | null = id;
      while (true) {
        const successorNode = nodes.find(n => n.id === successorId)!;
        if (!successorNode.left) break;
        successorParentId = successorId;
        successorId = successorNode.left;
      }
      const successor = nodes.find(n => n.id === successorId)!;

      // Copy successor value into current node
      nodes = nodes.map(n => n.id === id ? { ...n, value: successor.value } : n);

      // Remove successor node — link its parent to successor's right child
      if (successorParentId === id) {
        // Successor is direct right child
        nodes = nodes.filter(n => n.id !== successorId);
        nodes = nodes.map(n => n.id === id ? { ...n, right: successor.right } : n);
      } else {
        // Successor is deeper — its parent's left pointer should become successor's right
        nodes = nodes.filter(n => n.id !== successorId);
        nodes = nodes.map(n => n.id === successorParentId ? { ...n, left: successor.right } : n);
      }
      return id;
    }
  };

  const newRootId = deleteRec(rootId);

  if (treeType === 'avl-tree' && newRootId) {
    nodes = annotateAVL(nodes, newRootId);
    nodes = avlBalance(nodes, newRootId);
  }
  if (treeType === 'red-black-tree' && newRootId) {
    nodes = annotateAVL(nodes, newRootId);
    nodes = rbAnnotateColors(nodes, newRootId, true);
  }

  return { nodes, rootId: newRootId };
}


// BST search
function bstSearch(nodes: TreeNode[], rootId: string | null, value: number): boolean {
  let id = rootId;
  while (id) {
    const node = nodes.find(n => n.id === id);
    if (!node) return false;
    if (node.value === value) return true;
    id = value < node.value ? node.left : node.right;
  }
  return false;
}

export function AlgorithmVisualizer({ algorithm }: AlgorithmVisualizerProps) {
  const [arraySize, setArraySize] = useState(15);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetValue, setTargetValue] = useState<number>(50);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [steps, setSteps] = useState<VisualizationState[]>([]);
  const [state, setState] = useState<VisualizationState>(() => {
    const initialArray = generateRandomArray(15);
    return {
      type: 'array',
      array: initialArray,
      comparing: [],
      swapping: [],
      sorted: [],
      found: null
    };
  });

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize state based on algorithm category
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setSteps([]);

    switch (algorithm.category) {
      case 'sorting':
      case 'searching': {
        const initialArray = generateRandomArray(arraySize);
        setState({
          type: 'array',
          array: initialArray,
          comparing: [],
          swapping: [],
          sorted: [],
          found: null
        });
        break;
      }
      case 'stack':
        setState({ type: 'stack', stack: [] });
        break;
      case 'queue':
        setState({ type: 'queue', queue: [] });
        break;
      case 'linkedlist':
        setState({ type: 'linkedlist', nodes: [], searchResult: null });
        break;
      case 'hash':
        setState({
          type: 'hash',
          table: new Array(10).fill(null),
          buckets: Array(10).fill(null).map(() => []),
          getResult: null,
          isOpenHashing: algorithm.id === 'hash-open'
        });
        break;
      case 'tree':
        setState({ type: 'tree', nodes: [], rootId: null, searchResult: null });
        break;
      case 'graph':
        setState({ type: 'graph' });
        break;
      default: {
        const defaultArray = generateRandomArray(arraySize);
        setState({
          type: 'array',
          array: defaultArray,
          comparing: [],
          swapping: [],
          sorted: [],
          found: null
        });
      }
    }
  }, [algorithm.id, algorithm.category]);

  // Generate steps for sorting algorithms
  const generateSortingSteps = useCallback((arr: number[], sortType: string) => {
    const steps: VisualizationState[] = [];
    const array = [...arr];
    const n = array.length;

    const addStep = (comparing: number[] = [], swapping: number[] = [], sorted: number[] = []) => {
      steps.push({
        type: 'array',
        array: [...array],
        comparing: [...comparing],
        swapping: [...swapping],
        sorted: [...sorted],
        found: null
      });
    };

    addStep();

    switch (sortType) {
      case 'bubble-sort': {
        const sortedSet = new Set<number>();
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            addStep([j, j + 1], [], Array.from(sortedSet));
            if (array[j] > array[j + 1]) {
              addStep([j, j + 1], [j, j + 1], Array.from(sortedSet));
              [array[j], array[j + 1]] = [array[j + 1], array[j]];
              addStep([j, j + 1], [], Array.from(sortedSet));
            }
          }
          sortedSet.add(n - 1 - i);
          addStep([], [], Array.from(sortedSet));
        }
        sortedSet.add(0);
        addStep([], [], Array.from(sortedSet));
        break;
      }

      case 'selection-sort': {
        const sortedSet = new Set<number>();
        for (let i = 0; i < n - 1; i++) {
          let minIdx = i;
          for (let j = i + 1; j < n; j++) {
            addStep([minIdx, j], [], Array.from(sortedSet));
            if (array[j] < array[minIdx]) {
              minIdx = j;
            }
          }
          if (minIdx !== i) {
            addStep([i, minIdx], [i, minIdx], Array.from(sortedSet));
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
            addStep([i, minIdx], [], Array.from(sortedSet));
          }
          sortedSet.add(i);
          addStep([], [], Array.from(sortedSet));
        }
        sortedSet.add(n - 1);
        addStep([], [], Array.from(sortedSet));
        break;
      }

      case 'insertion-sort': {
        addStep([], [], [0]);
        for (let i = 1; i < n; i++) {
          let key = array[i];
          let j = i - 1;
          addStep([i], [], Array.from({ length: i }, (_, k) => k));
          while (j >= 0 && array[j] > key) {
            addStep([j, j + 1], [j, j + 1], Array.from({ length: i }, (_, k) => k));
            array[j + 1] = array[j];
            addStep([j, j + 1], [], Array.from({ length: i }, (_, k) => k));
            j--;
          }
          array[j + 1] = key;
          addStep([], [], Array.from({ length: i + 1 }, (_, k) => k));
        }
        break;
      }

      case 'merge-sort': {
        const mergeSort = (left: number, right: number) => {
          if (left >= right) return;
          const mid = Math.floor((left + right) / 2);
          mergeSort(left, mid);
          mergeSort(mid + 1, right);

          const temp: number[] = [];
          let i = left, j = mid + 1;

          while (i <= mid && j <= right) {
            addStep([i, j]);
            if (array[i] <= array[j]) {
              temp.push(array[i++]);
            } else {
              temp.push(array[j++]);
            }
          }
          while (i <= mid) temp.push(array[i++]);
          while (j <= right) temp.push(array[j++]);

          for (let k = 0; k < temp.length; k++) {
            array[left + k] = temp[k];
            addStep([], [left + k]);
          }
        };
        mergeSort(0, n - 1);
        addStep([], [], Array.from({ length: n }, (_, k) => k));
        break;
      }

      case 'radix-sort': {
        const max = Math.max(...array);
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
          const output = new Array(n);
          const count = new Array(10).fill(0);

          for (let i = 0; i < n; i++) {
            addStep([i]);
            count[Math.floor(array[i] / exp) % 10]++;
          }

          for (let i = 1; i < 10; i++) count[i] += count[i - 1];

          for (let i = n - 1; i >= 0; i--) {
            const digit = Math.floor(array[i] / exp) % 10;
            output[count[digit] - 1] = array[i];
            count[digit]--;
          }

          for (let i = 0; i < n; i++) {
            array[i] = output[i];
            addStep([], [i]);
          }
        }
        addStep([], [], Array.from({ length: n }, (_, k) => k));
        break;
      }

      case 'quick-sort': {
        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sortedIndices.add(low);
            addStep([], [], Array.from(sortedIndices));
          }
        };

        const sortedIndices = new Set<number>();
        const partition = (low: number, high: number) => {
          const pivot = array[high];
          let i = low - 1;

          for (let j = low; j < high; j++) {
            addStep([j, high]);
            if (array[j] < pivot) {
              i++;
              addStep([i, j], [i, j], Array.from(sortedIndices));
              [array[i], array[j]] = [array[j], array[i]];
              addStep([i, j], [], Array.from(sortedIndices));
            }
          }
          addStep([i + 1, high], [i + 1, high], Array.from(sortedIndices));
          [array[i + 1], array[high]] = [array[high], array[i + 1]];
          addStep([i + 1, high], [], Array.from(sortedIndices));

          sortedIndices.add(i + 1);
          addStep([], [], Array.from(sortedIndices));
          return i + 1;
        };

        quickSort(0, n - 1);
        addStep([], [], Array.from({ length: n }, (_, k) => k));
        break;
      }
    }

    return steps;
  }, []);

  // Generate steps for searching algorithms
  const generateSearchingSteps = useCallback((arr: number[], target: number, searchType: string) => {
    const steps: VisualizationState[] = [];

    if (searchType === 'linear-search') {
      const array = [...arr];

      const addStep = (comparing: number[] = [], found: number | null = null, notFound = false) => {
        steps.push({
          type: 'array',
          array: [...array],
          comparing: [...comparing],
          swapping: [],
          sorted: notFound ? Array.from({ length: array.length }, (_, k) => k) : [],
          found
        });
      };

      addStep();

      for (let i = 0; i < array.length; i++) {
        addStep([i]);
        if (array[i] === target) {
          addStep([i], i);
          return steps;
        }
      }

      addStep([], null, true);
      return steps;

    } else if (searchType === 'binary-search') {
      const array = [...arr].sort((a, b) => a - b);

      const addStep = (comparing: number[] = [], found: number | null = null, eliminated: number[] = []) => {
        steps.push({
          type: 'array',
          array: [...array],
          comparing: [...comparing],
          swapping: [],
          sorted: [...eliminated],
          found
        });
      };

      addStep();
      let left = 0;
      let right = array.length - 1;
      const eliminated: number[] = [];

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        addStep([mid], null, [...eliminated]);

        if (array[mid] === target) {
          addStep([mid], mid, [...eliminated]);
          return steps;
        } else if (array[mid] < target) {
          for (let i = left; i < mid; i++) eliminated.push(i);
          eliminated.push(mid);
          left = mid + 1;
        } else {
          for (let i = mid; i <= right; i++) eliminated.push(i);
          right = mid - 1;
        }
      }

      addStep([], null, Array.from({ length: array.length }, (_, k) => k));
      return steps;
    }

    return steps;
  }, []);

  // Auto play
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          setState(steps[prev + 1]);
          return prev + 1;
        });
      }, speed);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, steps, currentStep]);

  const handleRandomize = () => {
    setIsPlaying(false);
    setCurrentStep(0);

    if (algorithm.category === 'sorting' || algorithm.category === 'searching') {
      const newArray = generateRandomArray(arraySize);
      if (algorithm.category === 'sorting') {
        const newSteps = generateSortingSteps(newArray, algorithm.id);
        setSteps(newSteps);
        setState(newSteps[0]);
      } else {
        const newSteps = generateSearchingSteps(newArray, targetValue, algorithm.id);
        setSteps(newSteps);
        setState(newSteps[0]);
      }
    }
  };

  const handlePlayPause = () => {
    if (steps.length === 0 && (algorithm.category === 'sorting' || algorithm.category === 'searching')) {
      if (algorithm.category === 'sorting') {
        const newSteps = generateSortingSteps((state as any).array, algorithm.id);
        setSteps(newSteps);
        setState(newSteps[0]);
        setCurrentStep(0);
      } else {
        const newSteps = generateSearchingSteps((state as any).array, targetValue, algorithm.id);
        setSteps(newSteps);
        setState(newSteps[0]);
        setCurrentStep(0);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setState(steps[currentStep - 1]);
    }
  };

  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setState(steps[currentStep + 1]);
    }
  };

  const handleArraySizeChange = (size: number) => {
    setArraySize(Math.max(2, Math.min(50, size)));
    handleRandomize();
  };

  // Stack operations
  const handleStackPush = (value: string) => {
    if (state.type === 'stack') {
      const newStack = [...state.stack, { value, id: Date.now().toString() }];
      setState({ ...state, stack: newStack });
    }
  };

  const handleStackPop = () => {
    if (state.type === 'stack') {
      const newStack = state.stack.slice(0, -1);
      setState({ ...state, stack: newStack });
    }
  };

  // Queue operations
  const handleEnqueue = (value: string) => {
    if (state.type === 'queue') {
      const newQueue = [...state.queue, { value, id: Date.now().toString() }];
      setState({ ...state, queue: newQueue });
    }
  };

  const handleDequeue = () => {
    if (state.type === 'queue') {
      const newQueue = state.queue.slice(1);
      setState({ ...state, queue: newQueue });
    }
  };

  // Linked List operations
  const handleLinkedListInsert = (value: number) => {
    if (state.type === 'linkedlist') {
      const newNode: LinkedListNode = {
        value,
        id: Date.now().toString(),
        next: null
      };

      if (state.nodes.length === 0) {
        setState({ ...state, nodes: [newNode] });
      } else {
        const lastIndex = state.nodes.length - 1;
        const newNodes = [...state.nodes];
        newNodes[lastIndex] = { ...newNodes[lastIndex], next: newNode.id };
        newNodes.push(newNode);
        setState({ ...state, nodes: newNodes });
      }
    }
  };

  const handleLinkedListDelete = (value: number) => {
    if (state.type === 'linkedlist') {
      const index = state.nodes.findIndex(n => n.value === value);
      if (index === -1) {
        setState({ ...state, searchResult: false });
        return;
      }

      let newNodes = state.nodes.filter((_, i) => i !== index);
      if (index > 0) {
        newNodes = newNodes.map((node, i) =>
          i === index - 1
            ? { ...node, next: newNodes[index]?.id || null }
            : node
        );
      }
      setState({ ...state, nodes: newNodes });
    }
  };

  const handleLinkedListSearch = (value: number) => {
    if (state.type === 'linkedlist') {
      const found = state.nodes.some(n => n.value === value);
      setState({ ...state, searchResult: found });
    }
  };

  // Hash operations
  const hashFunction = (key: string, size: number) => {
    let hash = 0;
    for (let char of key) {
      hash += char.charCodeAt(0);
    }
    return hash % size;
  };

  const handleHashInsert = (key: string, value: string) => {
    if (state.type === 'hash') {
      const index = hashFunction(key, 10);
      const newEntry = { key, value, id: Date.now().toString() };

      if (state.isOpenHashing) {
        const newBuckets = state.buckets.map((b, i) =>
          i === index ? [...b, newEntry] : b
        );
        setState({ ...state, buckets: newBuckets });
      } else {
        const newTable = [...state.table];
        newTable[index] = newEntry;
        setState({ ...state, table: newTable });
      }
    }
  };

  const handleHashDelete = (key: string) => {
    if (state.type === 'hash') {
      const index = hashFunction(key, 10);

      if (state.isOpenHashing) {
        const newBuckets = state.buckets.map((b, i) =>
          i === index ? b.filter(e => e.key !== key) : b
        );
        setState({ ...state, buckets: newBuckets });
      } else {
        const newTable = [...state.table];
        if (newTable[index]?.key === key) {
          newTable[index] = null;
        }
        setState({ ...state, table: newTable });
      }
    }
  };

  const handleHashGet = (key: string) => {
    if (state.type === 'hash') {
      const index = hashFunction(key, 10);
      let result: string | null = null;

      if (state.isOpenHashing) {
        const entry = state.buckets[index].find(e => e.key === key);
        result = entry ? entry.value : null;
      } else {
        result = state.table[index]?.key === key ? state.table[index]!.value : null;
      }

      setState({ ...state, getResult: result });
    }
  };

  // Tree operations
  const handleTreeInsert = (value: number) => {
    if (state.type === 'tree') {
      const result = bstInsert(state.nodes, state.rootId, value, algorithm.id);
      setState({ ...state, nodes: result.nodes, rootId: result.rootId, searchResult: null });
    }
  };

  const handleTreeDelete = (value: number) => {
    if (state.type === 'tree') {
      const result = bstDelete(state.nodes, state.rootId, value, algorithm.id);
      setState({ ...state, nodes: result.nodes, rootId: result.rootId, searchResult: null });
    }
  };

  const handleTreeSearch = (value: number) => {
    if (state.type === 'tree') {
      const found = bstSearch(state.nodes, state.rootId, value);
      setState({ ...state, searchResult: found });
    }
  };

  const renderVisualization = () => {
    switch (state.type) {
      case 'array':
        return (
          <ArrayVisualization
            array={state.array}
            comparing={state.comparing}
            swapping={state.swapping}
            sorted={state.sorted}
            found={state.found}
            maxValue={100}
          />
        );
      case 'stack':
        if (algorithm.id === 'polish-notation') {
          return <ExpressionVisualization mode="prefix" />;
        }
        if (algorithm.id === 'reverse-polish') {
          return <ExpressionVisualization mode="postfix" />;
        }
        if (algorithm.id === 'evaluation') {
          return <ExpressionVisualization mode="evaluate" />;
        }
        return (
          <StackVisualization
            stack={state.stack}
            onPush={handleStackPush}
            onPop={handleStackPop}
          />
        );
      case 'queue':
        return (
          <QueueVisualization
            queue={state.queue}
            onEnqueue={handleEnqueue}
            onDequeue={handleDequeue}
            isCircular={algorithm.id === 'circular-queue'}
          />
        );
      case 'linkedlist':
        return (
          <LinkedListVisualization
            nodes={state.nodes}
            onInsert={handleLinkedListInsert}
            onDelete={handleLinkedListDelete}
            onSearch={handleLinkedListSearch}
            searchResult={state.searchResult}
            isDoubly={algorithm.id === 'doubly-linked-list'}
          />
        );
      case 'hash':
        return (
          <HashVisualization
            table={state.table}
            buckets={state.buckets}
            onInsert={handleHashInsert}
            onDelete={handleHashDelete}
            onGet={handleHashGet}
            getResult={state.getResult}
            isOpenHashing={state.isOpenHashing}
          />
        );
      case 'tree':
        return (
          <TreeVisualization
            nodes={state.nodes}
            rootId={state.rootId}
            onInsert={handleTreeInsert}
            onDelete={handleTreeDelete}
            onSearch={handleTreeSearch}
            searchResult={state.searchResult}
            treeType={algorithm.id as 'bst' | 'avl-tree' | 'red-black-tree'}
          />
        );
      case 'graph':
        return <GraphVisualization mode={algorithm.id} />;
      default:
        return null;
    }
  };

  const showControls = algorithm.category === 'sorting' || algorithm.category === 'searching';

  return (
    <div className="space-y-5">
      {/* Algorithm Info Card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-1">{algorithm.name}</h2>
        <p className="text-slate-500 text-sm mb-4 leading-relaxed">{algorithm.description}</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-semibold text-blue-700">Time: {algorithm.timeComplexity}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">Space: {algorithm.spaceComplexity}</span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      {showControls && (
        <Controls
          arraySize={arraySize}
          onArraySizeChange={handleArraySizeChange}
          order={order}
          onOrderChange={setOrder}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onRandomize={handleRandomize}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          canStepBack={currentStep > 0}
          canStepForward={currentStep < steps.length - 1}
          targetValue={targetValue}
          onTargetChange={setTargetValue}
          showTargetInput={algorithm.category === 'searching'}
          speed={speed}
          onSpeedChange={setSpeed}
        />
      )}

      {/* Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-slate-100 p-8 min-h-[300px] flex items-center justify-center shadow-sm"
      >
        {renderVisualization()}
      </motion.div>

      {/* Step Navigation for array-based algorithms */}
      {showControls && steps.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleStepBack}
            disabled={currentStep === 0 || isPlaying}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-300 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={handleStepForward}
            disabled={currentStep === steps.length - 1 || isPlaying}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-800 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Code Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
          {algorithm.name} — JavaScript Implementation
        </h3>
        <CodeDisplay code={algorithm.code} />
      </motion.div>
    </div>
  );
}

function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}
