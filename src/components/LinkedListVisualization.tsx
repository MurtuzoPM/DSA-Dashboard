import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LinkedListNode } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Search } from 'lucide-react';
import { useState } from 'react';

interface LinkedListVisualizationProps {
  nodes: LinkedListNode[];
  onInsert: (value: number) => void;
  onDelete: (value: number) => void;
  onSearch: (value: number) => void;
  searchResult?: boolean | null;
  isDoubly?: boolean;
  isCircular?: boolean;
}

export function LinkedListVisualization({ 
  nodes, 
  onInsert, 
  onDelete, 
  onSearch,
  searchResult,
  isDoubly = false,
  isCircular = false
}: LinkedListVisualizationProps) {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'insert' | 'delete' | 'search'>('insert');

  const handleAction = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    switch (mode) {
      case 'insert':
        onInsert(value);
        setInputValue('');
        break;
      case 'delete':
        onDelete(value);
        setInputValue('');
        break;
      case 'search':
        onSearch(value);
        break;
    }
  };

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
            variant={mode === 'delete' ? 'default' : 'outline'}
            onClick={() => setMode('delete')}
            className="flex items-center gap-1"
          >
            <Minus className="w-4 h-4" />
            Delete
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
          {searchResult ? 'Value found in the list!' : 'Value not found!'}
        </motion.div>
      )}

      <div className="flex items-center gap-1 overflow-x-auto max-w-full p-4">
        <AnimatePresence mode="popLayout">
          {nodes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-400 text-sm py-8"
            >
              Linked list is empty
            </motion.div>
          ) : (
            <>
              {/* Head pointer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center mr-2"
              >
                <span className="text-xs font-medium text-slate-500 mb-1">HEAD</span>
                <div className="w-0.5 h-8 bg-slate-400" />
              </motion.div>

              {nodes.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 400,
                    damping: 25
                  }}
                  className="flex items-center"
                >
                  {/* Node */}
                  <div className={cn(
                    "relative flex flex-col items-center",
                    isDoubly && "mx-2"
                  )}>
                    {/* Previous pointer (for doubly linked list) */}
                    {isDoubly && index > 0 && (
                      <div className="absolute -top-4 left-0 right-0 flex items-center justify-center">
                        <div className="w-8 h-0.5 bg-slate-300" />
                        <div className="w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-slate-300" />
                      </div>
                    )}

                    {/* Value box */}
                    <div className="flex">
                      <div className="w-14 h-14 bg-blue-500 text-white flex items-center justify-center font-mono text-lg font-bold rounded-l-lg border-2 border-blue-600">
                        {node.value}
                      </div>
                      <div className="w-10 h-14 bg-slate-200 flex items-center justify-center rounded-r-lg border-2 border-slate-300 border-l-0">
                        {node.next || (isCircular && index === nodes.length - 1) ? (
                          <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-slate-500" />
                        ) : (
                          <div className="w-4 h-0.5 bg-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Next pointer label */}
                    {isDoubly && index < nodes.length - 1 && (
                      <div className="absolute -bottom-4 left-0 right-0 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-slate-300 rotate-180" />
                        <div className="w-8 h-0.5 bg-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Arrow to next node */}
                  {index < nodes.length - 1 && (
                    <div className="w-8 h-0.5 bg-slate-400 mx-1" />
                  )}

                  {/* Circular link back to head */}
                  {isCircular && index === nodes.length - 1 && nodes.length > 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center ml-2"
                    >
                      <div className="w-6 h-0.5 bg-slate-400" />
                      <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-slate-400" />
                      <span className="text-xs text-slate-500 ml-1">to HEAD</span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="text-sm text-slate-500">
        Size: {nodes.length}
      </div>
    </div>
  );
}
