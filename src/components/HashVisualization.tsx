import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { HashEntry } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Search } from 'lucide-react';
import { useState } from 'react';

interface HashVisualizationProps {
  table: (HashEntry | null)[];
  buckets?: HashEntry[][];
  onInsert: (key: string, value: string) => void;
  onDelete: (key: string) => void;
  onGet: (key: string) => void;
  getResult?: string | null;
  isOpenHashing?: boolean;
}

export function HashVisualization({ 
  table, 
  buckets = [],
  onInsert, 
  onDelete, 
  onGet,
  getResult,
  isOpenHashing = false
}: HashVisualizationProps) {
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [mode, setMode] = useState<'insert' | 'delete' | 'get'>('insert');

  const handleAction = () => {
    if (!keyInput.trim()) return;

    switch (mode) {
      case 'insert':
        if (valueInput.trim()) {
          onInsert(keyInput.trim(), valueInput.trim());
          setKeyInput('');
          setValueInput('');
        }
        break;
      case 'delete':
        onDelete(keyInput.trim());
        setKeyInput('');
        break;
      case 'get':
        onGet(keyInput.trim());
        break;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Input
          type="text"
          placeholder="Key..."
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAction()}
          className="w-28"
        />
        {mode === 'insert' && (
          <Input
            type="text"
            placeholder="Value..."
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
            className="w-28"
          />
        )}
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
            variant={mode === 'get' ? 'default' : 'outline'}
            onClick={() => setMode('get')}
            className="flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            Get
          </Button>
        </div>
      </div>

      {getResult !== null && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            getResult !== undefined 
              ? "bg-green-100 text-green-700 border border-green-300" 
              : "bg-red-100 text-red-700 border border-red-300"
          )}
        >
          {getResult !== undefined ? `Value: ${getResult}` : 'Key not found!'}
        </motion.div>
      )}

      <div className="w-full max-w-2xl">
        {isOpenHashing ? (
          // Open Hashing (Separate Chaining)
          <div className="space-y-2">
            {buckets.map((bucket, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-10 bg-slate-700 text-white flex items-center justify-center font-mono font-bold rounded">
                  {index}
                </div>
                <div className="flex-1 min-h-[40px] bg-slate-100 rounded-lg border-2 border-slate-200 flex items-center gap-2 p-2 overflow-x-auto">
                  {bucket.length === 0 ? (
                    <span className="text-slate-400 text-sm">Empty</span>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {bucket.map((entry, entryIndex) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="flex items-center gap-2 flex-shrink-0"
                        >
                          <div className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium">
                            {entry.key}: {entry.value}
                          </div>
                          {entryIndex < bucket.length - 1 && (
                            <div className="w-4 h-0.5 bg-slate-400" />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Closed Hashing (Open Addressing)
          <div className="grid grid-cols-5 gap-2">
            {table.map((entry, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-1",
                  entry 
                    ? "bg-blue-500 border-blue-600 text-white" 
                    : "bg-slate-100 border-slate-200"
                )}
              >
                <span className="text-xs font-bold text-slate-500">{index}</span>
                {entry ? (
                  <div className="text-center">
                    <div className="text-xs font-medium truncate w-full">{entry.key}</div>
                    <div className="text-xs opacity-80 truncate w-full">{entry.value}</div>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">Empty</span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
