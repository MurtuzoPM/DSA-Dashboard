import {
  Search,
  ArrowUpDown,
  Layers,
  List,
  Link,
  Hash,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { categories, getAlgorithmsByCategory } from '@/data/algorithms';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  selectedAlgorithm: string;
  onSelectAlgorithm: (id: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Search,
  ArrowUpDown,
  Layers,
  List,
  Link,
  Hash,
};

const categoryColors: Record<string, string> = {
  searching: 'from-blue-500 to-cyan-400',
  sorting: 'from-purple-500 to-pink-400',
  stack: 'from-orange-500 to-yellow-400',
  queue: 'from-green-500 to-emerald-400',
  linkedlist: 'from-rose-500 to-red-400',
  hash: 'from-teal-500 to-cyan-400',
};

const categoryGlow: Record<string, string> = {
  searching: 'shadow-blue-500/30',
  sorting: 'shadow-purple-500/30',
  stack: 'shadow-orange-500/30',
  queue: 'shadow-green-500/30',
  linkedlist: 'shadow-rose-500/30',
  hash: 'shadow-teal-500/30',
};

export function Sidebar({ selectedAlgorithm, onSelectAlgorithm }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map(c => c.id)
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="w-72 flex flex-col h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, #0f1117 0%, #141624 50%, #0f1117 100%)' }}>
      {/* Logo / Header */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">DSA Dashboard</h1>
            <p className="text-slate-500 text-xs">Data Structures & Algorithms</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
        {categories.map((category, index) => {
          const Icon = iconMap[category.icon] || Search;
          const algos = getAlgorithmsByCategory(category.id);
          const isExpanded = expandedCategories.includes(category.id);
          const gradient = categoryColors[category.id] || 'from-slate-500 to-slate-400';
          const glow = categoryGlow[category.id] || '';

          if (algos.length === 0) return null;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="rounded-xl overflow-hidden"
            >
              {/* Category Button */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isExpanded
                    ? `bg-white/5 shadow-md ${glow}`
                    : 'hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-200 group-hover:scale-110',
                    gradient,
                    glow
                  )}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={cn(
                    'font-semibold text-sm transition-colors duration-200',
                    isExpanded ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  )}>
                    {category.name}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-colors duration-200',
                    isExpanded ? 'text-slate-300' : 'text-slate-600 group-hover:text-slate-400'
                  )} />
                </motion.div>
              </button>

              {/* Algorithm List */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 pl-3 border-l border-white/10 mt-1 pb-1 space-y-0.5">
                      {algos.map((algorithm, algIdx) => (
                        <motion.button
                          key={algorithm.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: algIdx * 0.04 }}
                          onClick={() => onSelectAlgorithm(algorithm.id)}
                          className={cn(
                            'w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                            selectedAlgorithm === algorithm.id
                              ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                          )}
                        >
                          {algorithm.name}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-slate-600 text-xs text-center">Presentation · 05-03-2026</p>
      </div>
    </div>
  );
}
