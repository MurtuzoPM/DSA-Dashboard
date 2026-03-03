import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { QueueItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface QueueVisualizationProps {
  queue: QueueItem[];
  onEnqueue: (value: string) => void;
  onDequeue: () => void;
  maxSize?: number;
  isCircular?: boolean;
}

export function QueueVisualization({ 
  queue, 
  onEnqueue, 
  onDequeue, 
  maxSize = 10,
  isCircular = false
}: QueueVisualizationProps) {
  const [inputValue, setInputValue] = useState('');

  const handleEnqueue = () => {
    if (inputValue.trim() && queue.length < maxSize) {
      onEnqueue(inputValue.trim());
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
          onKeyDown={(e) => e.key === 'Enter' && handleEnqueue()}
          className="w-32"
        />
        <Button 
          onClick={handleEnqueue}
          disabled={queue.length >= maxSize || !inputValue.trim()}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Enqueue
        </Button>
        <Button 
          variant="outline"
          onClick={onDequeue}
          disabled={queue.length === 0}
          className="flex items-center gap-1"
        >
          <Minus className="w-4 h-4" />
          Dequeue
        </Button>
      </div>

      <div className="relative">
        {/* Queue container */}
        <div className={cn(
          "w-96 h-32 border-2 border-slate-300 relative bg-slate-50 flex items-center",
          isCircular && "rounded-full px-8"
        )}>
          {/* Queue items */}
          <div className="flex items-center gap-2 px-4 overflow-hidden w-full justify-center">
            <AnimatePresence mode="popLayout">
              {queue.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.8 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 400,
                    damping: 25
                  }}
                  className={cn(
                    "min-w-[60px] py-3 px-4 rounded-md text-center font-mono text-lg font-medium shadow-md flex-shrink-0",
                    index === 0 
                      ? "bg-green-500 text-white border-2 border-green-600" 
                      : index === queue.length - 1
                        ? "bg-blue-500 text-white border-2 border-blue-600"
                        : "bg-slate-200 text-slate-700 border-2 border-slate-300"
                  )}
                >
                  {item.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Front pointer */}
          {queue.length > 0 && (
            <motion.div 
              className="absolute -top-10 left-8 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-sm font-medium text-green-600 mb-1">FRONT</div>
              <div className="w-0.5 h-6 bg-green-600" />
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-green-600" />
            </motion.div>
          )}

          {/* Rear pointer */}
          {queue.length > 0 && (
            <motion.div 
              className="absolute -bottom-10 right-8 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-blue-600" />
              <div className="w-0.5 h-6 bg-blue-600" />
              <div className="text-sm font-medium text-blue-600 mt-1">REAR</div>
            </motion.div>
          )}
        </div>

        {/* Empty state */}
        {queue.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-slate-400 text-sm">Queue is empty</span>
          </div>
        )}
      </div>

      <div className="text-sm text-slate-500">
        Size: {queue.length} / {maxSize}
      </div>
    </div>
  );
}
