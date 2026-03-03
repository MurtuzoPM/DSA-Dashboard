import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TreeNode } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

interface TreeVisualizationProps {
  nodes: TreeNode[];
  rootId: string | null;
  onInsert: (value: number) => void;
  onSearch: (value: number) => void;
  searchResult?: boolean | null;
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
  onSearch,
  searchResult
}: TreeVisualizationProps) {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'insert' | 'search'>('insert');

  // Calculate positions for tree nodes
  const positionedNodes = useMemo(() => {
    if (!rootId || nodes.length === 0) return [];
    
    const nodeMap = new Map<string, TreeNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));
    
    const result: PositionedNode[] = [];
    const levelHeight = 100;
    
    const calculatePositions = (
      nodeId: string | null, 
      level: number, 
      x: number, 
      width: number
    ) => {
      if (!nodeId) return;
      
      const node = nodeMap.get(nodeId);
      if (!node) return;
      
      const positionedNode: PositionedNode = {
        ...node,
        x,
        y: level * levelHeight + 50,
        level
      };
      result.push(positionedNode);
      
      const childWidth = width / 2;
      if (node.left) {
        calculatePositions(node.left, level + 1, x - childWidth / 2, childWidth);
      }
      if (node.right) {
        calculatePositions(node.right, level + 1, x + childWidth / 2, childWidth);
      }
    };
    
    calculatePositions(rootId, 0, 400, 800);
    return result;
  }, [nodes, rootId]);

  const handleAction = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    switch (mode) {
      case 'insert':
        onInsert(value);
        setInputValue('');
        break;
      case 'search':
        onSearch(value);
        break;
    }
  };

  // Find edges between nodes
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

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Input
          type="number"
          placeholder="Enter number..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAction()}
          className="w-32"
        />
        <div className="flex gap-1">
          <Button 
            variant={mode === 'insert' ? 'default' : 'outline'}
            onClick={() => setMode('insert')}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Insert
          </Button>
          <Button 
            variant={mode === 'search' ? 'default' : 'outline'}
            onClick={() => setMode('search')}
            className="flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
      </div>

      {searchResult !== null && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            searchResult 
              ? "bg-green-100 text-green-700 border border-green-300" 
              : "bg-red-100 text-red-700 border border-red-300"
          )}
        >
          {searchResult ? 'Value found in the tree!' : 'Value not found!'}
        </motion.div>
      )}

      <div className="relative w-full max-w-3xl h-96 bg-slate-50 rounded-lg border border-slate-200 overflow-auto">
        <svg className="absolute inset-0 w-full h-full" style={{ minWidth: '800px', minHeight: '400px' }}>
          {/* Edges */}
          {edges.map((edge, index) => (
            <motion.line
              key={index}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              x1={edge.from.x}
              y1={edge.from.y + 25}
              x2={edge.to.x}
              y2={edge.to.y - 25}
              stroke="#94a3b8"
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* Nodes */}
        <AnimatePresence mode="popLayout">
          {positionedNodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 400,
                damping: 25
              }}
              className="absolute w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-mono text-lg font-bold shadow-lg border-2 border-blue-600"
              style={{
                left: node.x - 24,
                top: node.y - 24,
              }}
            >
              {node.value}
            </motion.div>
          ))}
        </AnimatePresence>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-400 text-sm">Tree is empty</span>
          </div>
        )}
      </div>

      <div className="text-sm text-slate-500">
        Size: {nodes.length}
      </div>
    </div>
  );
}
