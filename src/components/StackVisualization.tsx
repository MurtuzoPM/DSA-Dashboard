import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { StackItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface StackVisualizationProps {
  stack: StackItem[];
  onPush: (value: string) => void;
  onPop: () => void;
  maxSize?: number;
}

export function StackVisualization({ 
  stack, 
  onPush, 
  onPop, 
  maxSize = 10 
}: StackVisualizationProps) {
  const [inputValue, setInputValue] = useState('');

  const handlePush = () => {
    if (inputValue.trim() && stack.length < maxSize) {
      onPush(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Enter value..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePush()}
          className="w-32"
        />
        <Button 
          onClick={handlePush}
          disabled={stack.length >= maxSize || !inputValue.trim()}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Push
        </Button>
        <Button 
          variant="outline"
          onClick={onPop}
          disabled={stack.length === 0}
          className="flex items-center gap-1"
        >
          <Minus className="w-4 h-4" />
          Pop
        </Button>
      </div>

      <div className="relative">
        {/* Stack container */}
        <div className="w-48 h-80 border-2 border-slate-300 border-t-0 rounded-b-lg relative bg-slate-50">
          {/* Stack items */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse items-center gap-1 p-2">
            <AnimatePresence mode="popLayout">
              {stack.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.8 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 400,
                    damping: 25
                  }}
                  className={cn(
                    "w-full py-3 px-4 rounded-md text-center font-mono text-lg font-medium shadow-md",
                    index === stack.length - 1 
                      ? "bg-blue-500 text-white border-2 border-blue-600" 
                      : "bg-slate-200 text-slate-700 border-2 border-slate-300"
                  )}
                >
                  {item.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Top pointer */}
          {stack.length > 0 && (
            <motion.div 
              className="absolute -right-16 top-1/2 -translate-y-1/2 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-sm font-medium text-blue-600">TOP</div>
              <div className="w-8 h-0.5 bg-blue-600" />
              <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-blue-600" />
            </motion.div>
          )}
        </div>

        {/* Empty state */}
        {stack.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-400 text-sm">Stack is empty</span>
          </div>
        )}
      </div>

      <div className="text-sm text-slate-500">
        Size: {stack.length} / {maxSize}
      </div>
    </div>
  );
}
