import { useState, useEffect, useCallback, useRef } from 'react';
import type { Algorithm, StackItem, QueueItem, LinkedListNode, HashEntry } from '@/types';
import { ArrayVisualization } from './ArrayVisualization';
import { Controls } from './Controls';
import { CodeDisplay } from './CodeDisplay';
import { StackVisualization } from './StackVisualization';
import { QueueVisualization } from './QueueVisualization';
import { LinkedListVisualization } from './LinkedListVisualization';
import { HashVisualization } from './HashVisualization';
import { ExpressionVisualization } from './ExpressionVisualization';
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
  | { type: 'hash'; table: (HashEntry | null)[]; buckets: HashEntry[][]; getResult: string | null; isOpenHashing: boolean };

export function AlgorithmVisualizer({ algorithm }: AlgorithmVisualizerProps) {
  const [arraySize, setArraySize] = useState(15);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetValue, setTargetValue] = useState<number>(50);
  const [currentStep, setCurrentStep] = useState(0);
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
      case 'searching':
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
      default:
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
      case 'bubble-sort':
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            addStep([j, j + 1]);
            if (array[j] > array[j + 1]) {
              addStep([j, j + 1], [j, j + 1]);
              [array[j], array[j + 1]] = [array[j + 1], array[j]];
              addStep([j, j + 1], []);
            }
          }
          addStep([], [], [n - 1 - i]);
        }
        addStep([], [], [0]);
        break;

      case 'selection-sort':
        for (let i = 0; i < n - 1; i++) {
          let minIdx = i;
          for (let j = i + 1; j < n; j++) {
            addStep([minIdx, j]);
            if (array[j] < array[minIdx]) {
              minIdx = j;
            }
          }
          if (minIdx !== i) {
            addStep([i, minIdx], [i, minIdx]);
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
            addStep([i, minIdx], []);
          }
          addStep([], [], [i]);
        }
        addStep([], [], [n - 1]);
        break;

      case 'insertion-sort':
        addStep([], [], [0]);
        for (let i = 1; i < n; i++) {
          let key = array[i];
          let j = i - 1;
          addStep([i]);
          while (j >= 0 && array[j] > key) {
            addStep([j, j + 1], [j, j + 1]);
            array[j + 1] = array[j];
            addStep([j, j + 1], []);
            j--;
          }
          array[j + 1] = key;
          addStep([], [], Array.from({ length: i + 1 }, (_, k) => k));
        }
        break;

      case 'merge-sort':
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

      case 'heap-sort':
        const heapify = (size: number, root: number) => {
          let largest = root;
          const left = 2 * root + 1;
          const right = 2 * root + 2;

          if (left < size) {
            addStep([largest, left]);
            if (array[left] > array[largest]) largest = left;
          }
          if (right < size) {
            addStep([largest, right]);
            if (array[right] > array[largest]) largest = right;
          }

          if (largest !== root) {
            addStep([root, largest], [root, largest]);
            [array[root], array[largest]] = [array[largest], array[root]];
            addStep([root, largest], []);
            heapify(size, largest);
          }
        };

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
          heapify(n, i);
        }

        for (let i = n - 1; i > 0; i--) {
          addStep([0, i], [0, i]);
          [array[0], array[i]] = [array[i], array[0]];
          addStep([0, i], []);
          addStep([], [], Array.from({ length: n - i }, (_, k) => n - 1 - k));
          heapify(i, 0);
        }
        addStep([], [], Array.from({ length: n }, (_, k) => k));
        break;
    }

    return steps;
  }, []);

  // Generate steps for searching algorithms
  const generateSearchingSteps = useCallback((arr: number[], target: number, searchType: string) => {
    const steps: VisualizationState[] = [];
    const array = [...arr].sort((a, b) => a - b);

    const addStep = (comparing: number[] = [], found: number | null = null) => {
      steps.push({
        type: 'array',
        array: [...array],
        comparing: [...comparing],
        swapping: [],
        sorted: [],
        found
      });
    };

    addStep();

    if (searchType === 'linear-search') {
      for (let i = 0; i < array.length; i++) {
        addStep([i]);
        if (array[i] === target) {
          addStep([i], i);
          return steps;
        }
      }
    } else if (searchType === 'binary-search') {
      let left = 0;
      let right = array.length - 1;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        addStep([mid]);

        if (array[mid] === target) {
          addStep([mid], mid);
          return steps;
        } else if (array[mid] < target) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
    }

    addStep([], -1);
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
      }, 500);
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
        const newNodes = [...state.nodes];
        newNodes[newNodes.length - 1].next = newNode.id;
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

      const newNodes = state.nodes.filter((_, i) => i !== index);
      if (index > 0 && index < newNodes.length) {
        newNodes[index - 1].next = newNodes[index]?.id || null;
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
        // Expression-based algorithms get their own specialized visualizer
        if (algorithm.id === 'polish-notation') {
          return <ExpressionVisualization mode="prefix" />;
        }
        if (algorithm.id === 'reverse-polish') {
          return <ExpressionVisualization mode="postfix" />;
        }
        if (algorithm.id === 'evaluation') {
          return <ExpressionVisualization mode="evaluate" />;
        }
        // Default: stack insertion/deletion + recursion show plain stack
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
            isCircular={algorithm.id === 'circular-linked-list'}
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
