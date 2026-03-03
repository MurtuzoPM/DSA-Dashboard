import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ArrayVisualizationProps {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  found?: number | null;
  maxValue?: number;
}

export function ArrayVisualization({ 
  array, 
  comparing = [], 
  swapping = [], 
  sorted = [],
  found = null,
  maxValue = 100 
}: ArrayVisualizationProps) {
  const getBarColor = (index: number) => {
    if (found === index) return 'bg-green-500';
    if (swapping.includes(index)) return 'bg-red-500';
    if (comparing.includes(index)) return 'bg-yellow-400';
    if (sorted.includes(index)) return 'bg-green-400';
    return 'bg-blue-400';
  };

  return (
    <div className="flex items-end justify-center gap-1 h-64 w-full px-4">
      {array.map((value, index) => (
        <motion.div
          key={`${index}-${value}`}
          layout
          initial={{ height: 0 }}
          animate={{ 
            height: `${(value / maxValue) * 100}%`,
          }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
          className={cn(
            "flex-1 rounded-t-md min-w-[20px] max-w-[60px] relative transition-colors duration-200",
            getBarColor(index)
          )}
        >
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-600">
            {value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
