import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AlgorithmVisualizer } from '@/components/AlgorithmVisualizer';
import { getAlgorithmById } from '@/data/algorithms';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, GraduationCap } from 'lucide-react';

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('linear-search');

  const algorithm = getAlgorithmById(selectedAlgorithm);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4f8' }}>
      <Sidebar
        selectedAlgorithm={selectedAlgorithm}
        onSelectAlgorithm={setSelectedAlgorithm}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900 font-bold text-base leading-tight">Dashboard — Presentation</h1>
              <p className="text-slate-400 text-xs">Data Structures &amp; Algorithms · At most 2 students per group</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow-md shadow-cyan-200">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-semibold">Date: 05 - 03 - 2026</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-6">
            <AnimatePresence mode="wait">
              {algorithm ? (
                <motion.div
                  key={algorithm.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <AlgorithmVisualizer algorithm={algorithm} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-96 text-center"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                    <GraduationCap className="w-10 h-10 text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-700 mb-2">
                    Welcome to DSA Dashboard
                  </h2>
                  <p className="text-slate-500 max-w-md text-sm">
                    Select a topic from the sidebar to visualize and explore different data structures and algorithms.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
