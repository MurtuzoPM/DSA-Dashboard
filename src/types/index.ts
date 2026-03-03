export interface Algorithm {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface AlgorithmState {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  found: number | null;
  currentStep: number;
  isPlaying: boolean;
}

export interface StackItem {
  value: string | number;
  id: string;
}

export interface QueueItem {
  value: string | number;
  id: string;
}

export interface LinkedListNode {
  value: number;
  id: string;
  next: string | null;
}

export interface TreeNode {
  value: number;
  id: string;
  left: string | null;
  right: string | null;
  height?: number;
}

export interface HashEntry {
  key: string;
  value: string;
  id: string;
}

export type AlgorithmCategory = 
  | 'searching'
  | 'sorting'
  | 'stack'
  | 'queue'
  | 'linkedlist'
  | 'hash'
  | 'tree'
  | 'graph';
