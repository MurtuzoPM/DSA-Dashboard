import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TreeNode } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Search, RotateCcw } from 'lucide-react';
import { useState, useMemo } from 'react';

interface TreeVisualizationProps {
  nodes: TreeNode[];
  rootId: string | null;
  onInsert: (value: number) => void;
  onDelete: (value: number) => void;
  onSearch: (value: number) => void;
  searchResult?: boolean | null;
  treeType: 'bst' | 'avl-tree' | 'red-black-tree';
}

interface PositionedNode extends TreeNode {
  x: number;
  y: number;
  level: number;
}

export function TreeVisualization({
  nodes,
  rootId,
  onInsert,
  onDelete,
  onSearch,
  searchResult,
  treeType,
}: TreeVisualizationProps) {
  const [inputValue, setInputValue] = useState('');

  const positionedNodes = useMemo(() => {
    if (!rootId || nodes.length === 0) return [];

    const nodeMap = new Map<string, TreeNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    const result: PositionedNode[] = [];
    const levelHeight = 90;

    const subtreeWidth = (nodeId: string | null): number => {
      if (!nodeId) return 0;
      const node = nodeMap.get(nodeId);
      if (!node) return 0;
      const lw = subtreeWidth(node.left);
      const rw = subtreeWidth(node.right);
      return Math.max(1, lw + rw);
    };

    const calculatePositions = (
      nodeId: string | null,
      level: number,
      x: number,
      width: number
    ) => {
      if (!nodeId) return;
      const node = nodeMap.get(nodeId);
      if (!node) return;

      result.push({ ...node, x, y: level * levelHeight + 60, level });

      const lw = subtreeWidth(node.left);
      const rw = subtreeWidth(node.right);
      const total = lw + rw || 1;

      if (node.left) {
        const childX = x - (width / 2) * (rw / total + 0.5);
        calculatePositions(node.left, level + 1, childX, width / 2);
      }
      if (node.right) {
        const childX = x + (width / 2) * (lw / total + 0.5);
        calculatePositions(node.right, level + 1, childX, width / 2);
      }
    };

    calculatePositions(rootId, 0, 420, 840);
    return result;
  }, [nodes, rootId]);

  // --- Action handlers (directly fire operations) ---
  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;
    onInsert(value);
    setInputValue('');
  };

  const handleDelete = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;
    onDelete(value);
    setInputValue('');
  };

  const handleSearch = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleInsert();
  };

  const edges = useMemo(() => {
    const edgeList: { from: PositionedNode; to: PositionedNode }[] = [];
    const nodeMap = new Map(positionedNodes.map(n => [n.id, n]));
    positionedNodes.forEach(node => {
      if (node.left) {
        const leftNode = nodeMap.get(node.left);
        if (leftNode) edgeList.push({ from: node, to: leftNode });
      }
      if (node.right) {
        const rightNode = nodeMap.get(node.right);
        if (rightNode) edgeList.push({ from: node, to: rightNode });
      }
    });
    return edgeList;
  }, [positionedNodes]);

  const getNodeColor = (node: PositionedNode) => {
    if (treeType === 'red-black-tree') {
      return node.color === 'red'
        ? 'bg-red-500 border-red-700 text-white'
        : 'bg-gray-900 border-gray-600 text-white';
    }
    if (treeType === 'avl-tree') {
      const bf = node.balanceFactor ?? 0;
      if (Math.abs(bf) > 1) return 'bg-orange-500 border-orange-700 text-white';
      return 'bg-violet-500 border-violet-700 text-white';
    }
    return 'bg-blue-500 border-blue-700 text-white';
  };

  const inorder = useMemo(() => {
    const result: number[] = [];
    const nodeMap = new Map<string, TreeNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));
    const traverse = (id: string | null) => {
      if (!id) return;
      const n = nodeMap.get(id);
      if (!n) return;
      traverse(n.left);
      result.push(n.value);
      traverse(n.right);
    };
    traverse(rootId);
    return result;
  }, [nodes, rootId]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* Controls — each button directly performs its operation */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <Input
            type="number"
            placeholder="Enter a number..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-40 text-center"
          />
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            onClick={handleInsert}
            disabled={inputValue === ''}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" /> Insert
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={inputValue === ''}
            className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
          <Button
            variant="outline"
            onClick={handleSearch}
            disabled={inputValue === ''}
            className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            <Search className="w-4 h-4" /> Search
          </Button>
        </div>
        <p className="text-xs text-slate-400">
          Type a number and click Insert / Delete / Search
        </p>
      </div>

      {/* RBT Legend */}
      {treeType === 'red-black-tree' && (
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-slate-600">Red node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gray-900" />
            <span className="text-slate-600">Black node</span>
          </div>
        </div>
      )}

      {/* AVL Legend */}
      {treeType === 'avl-tree' && (
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-violet-500" />
            <span className="text-slate-600">Balanced (|BF| ≤ 1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span className="text-slate-600">Unbalanced</span>
          </div>
        </div>
      )}

      {/* Search result */}
      <AnimatePresence>
        {searchResult !== null && searchResult !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium',
              searchResult
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            )}
          >
            {searchResult ? '✓ Value found in the tree!' : '✗ Value not found!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tree canvas */}
      <div className="relative w-full max-w-3xl h-[380px] bg-slate-50 rounded-xl border border-slate-200 overflow-auto">
        <svg
          className="absolute inset-0"
          style={{ minWidth: '840px', minHeight: '380px', width: '100%', height: '100%' }}
        >
          {/* Edges */}
          {edges.map((edge, i) => (
            <motion.line
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              x1={edge.from.x}
              y1={edge.from.y + 22}
              x2={edge.to.x}
              y2={edge.to.y - 22}
              stroke="#94a3b8"
              strokeWidth="2"
            />
          ))}

          {/* AVL labels */}
          {treeType === 'avl-tree' && positionedNodes.map(node => (
            <g key={`labels-${node.id}`}>
              <text x={node.x + 26} y={node.y - 12} fontSize="10" fill="#6d28d9" fontWeight="bold">
                {node.balanceFactor !== undefined ? `BF:${node.balanceFactor}` : ''}
              </text>
              <text x={node.x - 26} y={node.y - 12} fontSize="10" fill="#7c3aed" textAnchor="end">
                {node.height !== undefined ? `h:${node.height}` : ''}
              </text>
            </g>
          ))}
        </svg>

        {/* Nodes */}
        <AnimatePresence mode="popLayout">
          {positionedNodes.map(node => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                'absolute w-11 h-11 rounded-full flex items-center justify-center font-mono text-xs font-bold shadow-lg border-2 cursor-default select-none',
                getNodeColor(node)
              )}
              style={{ left: node.x - 22, top: node.y - 22 }}
              title={`Value: ${node.value}${treeType === 'avl-tree' ? `, h:${node.height}, BF:${node.balanceFactor}` : treeType === 'red-black-tree' ? `, ${node.color}` : ''}`}
            >
              {node.value}
            </motion.div>
          ))}
        </AnimatePresence>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <RotateCcw className="w-8 h-8 text-slate-300" />
            <span className="text-slate-400 text-sm">
              Tree is empty — type a number and click Insert
            </span>
          </div>
        )}
      </div>

      {/* In-order traversal */}
      {inorder.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap justify-center max-w-2xl">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In-order:</span>
          {inorder.map((v, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded text-xs font-mono"
            >
              {v}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs text-slate-400">Nodes: {nodes.length}</div>
    </div>
  );
}
