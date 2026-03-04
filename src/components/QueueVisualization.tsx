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

// ─── Circular layout helpers ──────────────────────────────────────────────────
const CAPACITY = 8; // fixed ring capacity shown visually

function getSlotPosition(index: number, total: number, radius: number) {
  // Distribute slots evenly around the circle, starting from top (−π/2)
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
    angle: (angle * 180) / Math.PI,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QueueVisualization({
  queue,
  onEnqueue,
  onDequeue,
  maxSize = 10,
  isCircular = false,
}: QueueVisualizationProps) {
  const [inputValue, setInputValue] = useState('');
  const circularMax = isCircular ? CAPACITY : maxSize;

  const handleEnqueue = () => {
    if (inputValue.trim() && queue.length < circularMax) {
      onEnqueue(inputValue.trim());
      setInputValue('');
    }
  };

  // ─── Circular (Ring) Visualization ─────────────────────────────────────────
  if (isCircular) {
    const radius = 130;
    const center = 160; // SVG/div coordinate center
    const size = center * 2;

    return (
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Enter value..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEnqueue()}
            className="w-32"
          />
          <Button
            onClick={handleEnqueue}
            disabled={queue.length >= circularMax || !inputValue.trim()}
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

        {/* Ring diagram */}
        <div className="relative" style={{ width: size, height: size }}>
          {/* SVG guide circle */}
          <svg
            className="absolute inset-0"
            width={size}
            height={size}
            style={{ overflow: 'visible' }}
          >
            {/* Dashed guide ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeDasharray="8 5"
            />
            {/* Arrow showing circular direction */}
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
              </marker>
            </defs>
            <path
              d={`M ${center + radius - 10},${center - 20} A ${radius},${radius} 0 0,1 ${center + radius - 10},${center + 20}`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
            />
          </svg>

          {/* Slots */}
          {Array.from({ length: CAPACITY }).map((_, slotIdx) => {
            const { x, y } = getSlotPosition(slotIdx, CAPACITY, radius);
            const queueIdx = slotIdx < queue.length ? slotIdx : -1;
            const item = queueIdx >= 0 ? queue[queueIdx] : null;
            const isFront = queueIdx === 0;
            const isRear = queueIdx === queue.length - 1 && queue.length > 0;

            return (
              <div
                key={slotIdx}
                className="absolute"
                style={{
                  left: center + x - 28,
                  top: center + y - 28,
                  width: 56,
                  height: 56,
                }}
              >
                <AnimatePresence mode="wait">
                  {item ? (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={cn(
                        'w-full h-full rounded-full flex flex-col items-center justify-center font-mono font-bold text-white text-sm shadow-lg border-2',
                        isFront
                          ? 'bg-green-500 border-green-400 shadow-green-200'
                          : isRear
                            ? 'bg-blue-500 border-blue-400 shadow-blue-200'
                            : 'bg-slate-500 border-slate-400'
                      )}
                    >
                      <span>{item.value}</span>
                      {isFront && (
                        <span className="text-[8px] font-semibold opacity-80 leading-none">F</span>
                      )}
                      {isRear && !isFront && (
                        <span className="text-[8px] font-semibold opacity-80 leading-none">R</span>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`empty-${slotIdx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center"
                    >
                      <span className="text-slate-300 text-xs font-mono">{slotIdx}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Circular</div>
            <div className="text-xs text-slate-400">Queue</div>
            <div className="text-xs text-slate-500 mt-1">{queue.length}/{CAPACITY}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>Front (dequeue here)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span>Rear (enqueue here)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-500" />
            <span>Occupied</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Linear Queue Visualization ─────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Enter value..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEnqueue()}
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
        <div className="w-96 h-32 border-2 border-slate-300 relative bg-slate-50 flex items-center">
          <div className="flex items-center gap-2 px-4 overflow-hidden w-full justify-center">
            <AnimatePresence mode="popLayout">
              {queue.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={cn(
                    'min-w-[60px] py-3 px-4 rounded-md text-center font-mono text-lg font-medium shadow-md flex-shrink-0',
                    index === 0
                      ? 'bg-green-500 text-white border-2 border-green-600'
                      : index === queue.length - 1
                        ? 'bg-blue-500 text-white border-2 border-blue-600'
                        : 'bg-slate-200 text-slate-700 border-2 border-slate-300'
                  )}
                >
                  {item.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

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
