import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RefreshCw } from 'lucide-react';

// ─── Preset Graph ────────────────────────────────────────────────────────────
const NODES = [
    { id: 'A', label: 'A', x: 210, y: 60 },
    { id: 'B', label: 'B', x: 100, y: 180 },
    { id: 'C', label: 'C', x: 320, y: 180 },
    { id: 'D', label: 'D', x: 50, y: 300 },
    { id: 'E', label: 'E', x: 200, y: 300 },
    { id: 'F', label: 'F', x: 370, y: 300 },
];

const EDGES: { from: string; to: string; weight: number }[] = [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'B', to: 'E', weight: 10 },
    { from: 'C', to: 'E', weight: 3 },
    { from: 'C', to: 'F', weight: 8 },
    { from: 'D', to: 'E', weight: 2 },
    { from: 'E', to: 'F', weight: 1 },
];

const VERTEX_LABELS = NODES.map(n => n.id);
const INF = Infinity;

// Adjacency list (undirected)
const buildAdjList = () => {
    const adj: Record<string, { node: string; w: number }[]> = {};
    VERTEX_LABELS.forEach(v => (adj[v] = []));
    EDGES.forEach(e => {
        adj[e.from].push({ node: e.to, w: e.weight });
        adj[e.to].push({ node: e.from, w: e.weight });
    });
    return adj;
};

// Adjacency matrix
const buildAdjMatrix = () => {
    const mat: number[][] = Array.from({ length: 6 }, () => new Array(6).fill(INF));
    VERTEX_LABELS.forEach((_, i) => (mat[i][i] = 0));
    EDGES.forEach(e => {
        const i = VERTEX_LABELS.indexOf(e.from);
        const j = VERTEX_LABELS.indexOf(e.to);
        mat[i][j] = e.weight;
        mat[j][i] = e.weight;
    });
    return mat;
};

// ─── DFS / BFS Steps ─────────────────────────────────────────────────────────
type TraversalStep = { visited: string[]; current: string | null; queue: string[] };

const buildDFSSteps = (start = 'A'): TraversalStep[] => {
    const adj = buildAdjList();
    const steps: TraversalStep[] = [];
    const visited = new Set<string>();

    const dfs = (node: string) => {
        visited.add(node);
        steps.push({ visited: [...visited], current: node, queue: [] });
        for (const { node: n } of adj[node]) {
            if (!visited.has(n)) dfs(n);
        }
    };
    dfs(start);
    steps.push({ visited: [...visited], current: null, queue: [] });
    return steps;
};

const buildBFSSteps = (start = 'A'): TraversalStep[] => {
    const adj = buildAdjList();
    const steps: TraversalStep[] = [];
    const visited = new Set<string>([start]);
    const queue = [start];

    while (queue.length > 0) {
        const node = queue.shift()!;
        steps.push({ visited: [...visited], current: node, queue: [...queue] });
        for (const { node: n } of adj[node]) {
            if (!visited.has(n)) {
                visited.add(n);
                queue.push(n);
            }
        }
    }
    steps.push({ visited: [...visited], current: null, queue: [] });
    return steps;
};

// ─── Dijkstra Steps ──────────────────────────────────────────────────────────
type DijkstraStep = { dist: Record<string, number>; prev: Record<string, string | null>; visited: string[]; current: string | null };

const buildDijkstraSteps = (source = 'A'): DijkstraStep[] => {
    const adj = buildAdjList();
    const steps: DijkstraStep[] = [];
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    const visited = new Set<string>();

    VERTEX_LABELS.forEach(v => { dist[v] = INF; prev[v] = null; });
    dist[source] = 0;

    const pq = [...VERTEX_LABELS];

    while (pq.length > 0) {
        pq.sort((a, b) => dist[a] - dist[b]);
        const u = pq.shift()!;
        if (dist[u] === INF) break;
        visited.add(u);
        steps.push({ dist: { ...dist }, prev: { ...prev }, visited: [...visited], current: u });
        for (const { node: v, w } of adj[u]) {
            const newD = dist[u] + w;
            if (newD < dist[v]) {
                dist[v] = newD;
                prev[v] = u;
            }
        }
    }
    steps.push({ dist: { ...dist }, prev: { ...prev }, visited: [...visited], current: null });
    return steps;
};

// ─── Bellman-Ford Steps ───────────────────────────────────────────────────────
type BFStep = { dist: Record<string, number>; iteration: number; relaxedEdge: string | null };

const buildBellmanFordSteps = (source = 'A'): BFStep[] => {
    const steps: BFStep[] = [];
    const dist: Record<string, number> = {};
    VERTEX_LABELS.forEach(v => (dist[v] = INF));
    dist[source] = 0;

    steps.push({ dist: { ...dist }, iteration: 0, relaxedEdge: null });

    for (let i = 0; i < VERTEX_LABELS.length - 1; i++) {
        let changed = false;
        for (const { from, to, weight } of EDGES) {
            // both directions (undirected)
            for (const [u, v] of [[from, to], [to, from]]) {
                if (dist[u] !== INF && dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    changed = true;
                    steps.push({ dist: { ...dist }, iteration: i + 1, relaxedEdge: `${u}→${v}` });
                }
            }
        }
        if (!changed) break;
    }
    return steps;
};

// ─── Floyd-Warshall Steps ────────────────────────────────────────────────────
type FWStep = { matrix: number[][]; k: number; i: number; j: number; improved: boolean };

const buildFWSteps = (): FWStep[] => {
    const steps: FWStep[] = [];
    const dist = buildAdjMatrix();
    const V = VERTEX_LABELS.length;

    steps.push({ matrix: dist.map(r => [...r]), k: -1, i: -1, j: -1, improved: false });

    for (let k = 0; k < V; k++) {
        for (let i = 0; i < V; i++) {
            for (let j = 0; j < V; j++) {
                if (dist[i][k] !== INF && dist[k][j] !== INF && dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    steps.push({ matrix: dist.map(r => [...r]), k, i, j, improved: true });
                }
            }
        }
    }
    steps.push({ matrix: dist.map(r => [...r]), k: -1, i: -1, j: -1, improved: false });
    return steps;
};

// ─── Graph SVG Component ─────────────────────────────────────────────────────
interface GraphSVGProps {
    visitedNodes?: string[];
    currentNode?: string | null;
    highlightEdges?: { from: string; to: string }[];
    pathNodes?: string[];
}

function GraphSVG({ visitedNodes = [], currentNode = null, highlightEdges = [], pathNodes = [] }: GraphSVGProps) {
    const getNodeColor = (id: string) => {
        if (id === currentNode) return '#f59e0b';
        if (pathNodes.includes(id)) return '#10b981';
        if (visitedNodes.includes(id)) return '#6366f1';
        return '#94a3b8';
    };

    const isEdgeHighlighted = (e: { from: string; to: string }) =>
        highlightEdges.some(h => (h.from === e.from && h.to === e.to) || (h.from === e.to && h.to === e.from));

    const isEdgeOnPath = (e: { from: string; to: string }) => {
        for (let i = 0; i < pathNodes.length - 1; i++) {
            if (
                (pathNodes[i] === e.from && pathNodes[i + 1] === e.to) ||
                (pathNodes[i] === e.to && pathNodes[i + 1] === e.from)
            )
                return true;
        }
        return false;
    };

    const nodeMap = new Map(NODES.map(n => [n.id, n]));

    return (
        <svg width="430" height="370" viewBox="0 0 430 370">
            {/* Edges */}
            {EDGES.map((e, i) => {
                const from = nodeMap.get(e.from)!;
                const to = nodeMap.get(e.to)!;
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                const highlighted = isEdgeHighlighted(e);
                const onPath = isEdgeOnPath(e);
                return (
                    <g key={i}>
                        <line
                            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                            stroke={onPath ? '#10b981' : highlighted ? '#f59e0b' : '#cbd5e1'}
                            strokeWidth={onPath ? 3 : highlighted ? 2.5 : 1.5}
                        />
                        <text x={mx} y={my - 5} fontSize="11" textAnchor="middle" fill="#64748b" fontWeight="600">
                            {e.weight}
                        </text>
                    </g>
                );
            })}

            {/* Nodes */}
            {NODES.map(node => (
                <g key={node.id}>
                    <circle cx={node.x} cy={node.y} r={22} fill={getNodeColor(node.id)} stroke="white" strokeWidth="2.5" />
                    <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
                        {node.label}
                    </text>
                </g>
            ))}
        </svg>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface GraphVisualizationProps {
    mode: string; // graph-representation | dfs | bfs | dijkstra | bellman-ford | floyd-warshall
}

export function GraphVisualization({ mode }: GraphVisualizationProps) {
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const dfsSteps = useMemo(() => buildDFSSteps(), []);
    const bfsSteps = useMemo(() => buildBFSSteps(), []);
    const dijkSteps = useMemo(() => buildDijkstraSteps(), []);
    const bfSteps = useMemo(() => buildBellmanFordSteps(), []);
    const fwSteps = useMemo(() => buildFWSteps(), []);

    const totalSteps = useMemo(() => {
        if (mode === 'dfs') return dfsSteps.length;
        if (mode === 'bfs') return bfsSteps.length;
        if (mode === 'dijkstra') return dijkSteps.length;
        if (mode === 'bellman-ford') return bfSteps.length;
        if (mode === 'floyd-warshall') return fwSteps.length;
        return 0;
    }, [mode, dfsSteps, bfsSteps, dijkSteps, bfSteps, fwSteps]);

    useEffect(() => {
        setStep(0);
        setIsPlaying(false);
    }, [mode]);

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setStep(prev => {
                    if (prev >= totalSteps - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 700);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isPlaying, totalSteps]);

    const reset = () => { setStep(0); setIsPlaying(false); };

    // ── Graph Representation ──────────────────────────────────────────────────
    if (mode === 'graph-representation') {
        const matrix = buildAdjMatrix();
        const adj = buildAdjList();
        return (
            <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                    {/* Graph SVG */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-semibold text-slate-600">Graph</span>
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-2">
                            <GraphSVG />
                        </div>
                    </div>

                    {/* Adjacency Matrix */}
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-600">Adjacency Matrix</span>
                        <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <table className="text-xs font-mono border-collapse">
                                <thead>
                                    <tr>
                                        <th className="w-8 h-8 text-slate-400 border border-slate-200 bg-slate-100"></th>
                                        {VERTEX_LABELS.map(v => (
                                            <th key={v} className="w-10 h-8 text-center text-blue-700 font-bold border border-slate-200 bg-blue-50">{v}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {VERTEX_LABELS.map((v, i) => (
                                        <tr key={v}>
                                            <td className="w-8 h-8 text-center text-blue-700 font-bold border border-slate-200 bg-blue-50">{v}</td>
                                            {matrix[i].map((val, j) => (
                                                <td key={j} className={cn(
                                                    'w-10 h-8 text-center border border-slate-200',
                                                    val === 0 ? 'text-slate-300' : val === INF ? 'text-slate-300' : 'text-slate-700 font-semibold bg-white'
                                                )}>
                                                    {val === INF ? '∞' : val === 0 ? '0' : val}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Adjacency List */}
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-600">Adjacency List</span>
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 min-w-[160px]">
                            {VERTEX_LABELS.map(v => (
                                <div key={v} className="flex items-center gap-1 mb-1 font-mono text-xs">
                                    <span className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">{v}</span>
                                    <span className="text-slate-400">→</span>
                                    {adj[v].map(({ node, w }, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">
                                            {node}({w})
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Traversal controls ────────────────────────────────────────────────────
    const Controls = () => (
        <div className="flex items-center gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={reset}><RefreshCw className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>◀</Button>
            <Button size="sm" onClick={() => setIsPlaying(p => !p)}>
                {isPlaying
                    ? <><Pause className="w-3.5 h-3.5 mr-1" /> Pause</>
                    : <><Play className="w-3.5 h-3.5 mr-1" /> Play</>}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setStep(s => Math.min(totalSteps - 1, s + 1))} disabled={step >= totalSteps - 1}>
                <SkipForward className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-slate-500">Step {step + 1}/{totalSteps}</span>
        </div>
    );

    // ── DFS ───────────────────────────────────────────────────────────────────
    if (mode === 'dfs') {
        const s = dfsSteps[step];
        return (
            <div className="flex flex-col gap-4 items-center w-full">
                <Controls />
                <div className="flex gap-6 items-start flex-wrap justify-center">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-2">
                        <GraphSVG visitedNodes={s.visited} currentNode={s.current} />
                    </div>
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">DFS Call Stack</div>
                            <div className="flex flex-col-reverse gap-1">
                                {s.visited.map((v, i) => (
                                    <motion.div key={v} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        className={cn('px-3 py-1.5 rounded-lg text-sm font-mono font-bold',
                                            v === s.current ? 'bg-amber-100 border border-amber-300 text-amber-700'
                                                : 'bg-indigo-50 border border-indigo-100 text-indigo-700')}>
                                        {v}
                                        {i === s.visited.length - 1 && v === s.current && <span className="ml-2 text-xs text-amber-500">← current</span>}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                            <div className="text-xs font-semibold text-slate-500 mb-1">Visit order so far:</div>
                            <div className="font-mono text-sm text-slate-700">{s.visited.join(' → ')}</div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />Unvisited</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Current</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />Visited</span>
                </div>
            </div>
        );
    }

    // ── BFS ───────────────────────────────────────────────────────────────────
    if (mode === 'bfs') {
        const s = bfsSteps[step];
        return (
            <div className="flex flex-col gap-4 items-center w-full">
                <Controls />
                <div className="flex gap-6 items-start flex-wrap justify-center">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-2">
                        <GraphSVG visitedNodes={s.visited} currentNode={s.current} />
                    </div>
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Queue (front → rear)</div>
                            <div className="flex gap-1 flex-wrap">
                                {s.queue.length === 0
                                    ? <span className="text-slate-400 text-xs">Empty</span>
                                    : s.queue.map((v, i) => (
                                        <span key={i} className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded font-mono text-sm font-bold">{v}</span>
                                    ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                            <div className="text-xs font-semibold text-slate-500 mb-1">Visit order so far:</div>
                            <div className="font-mono text-sm text-slate-700">{s.visited.join(' → ')}</div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />Unvisited</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Current</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />Visited</span>
                </div>
            </div>
        );
    }

    // ── Dijkstra ──────────────────────────────────────────────────────────────
    if (mode === 'dijkstra') {
        const s = dijkSteps[step];

        // Build path to each node from prev
        const getPath = (target: string) => {
            const path: string[] = [];
            let cur: string | null = target;
            while (cur) {
                path.unshift(cur);
                cur = s.prev[cur] ?? null;
            }
            return path;
        };

        return (
            <div className="flex flex-col gap-4 items-center w-full">
                <Controls />
                <div className="flex gap-6 items-start flex-wrap justify-center">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-2">
                        <GraphSVG visitedNodes={s.visited} currentNode={s.current} />
                    </div>
                    <div className="flex flex-col gap-3 min-w-[260px]">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Distance Table (Source: A)</span>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">Node</th>
                                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">Distance</th>
                                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">Path</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {VERTEX_LABELS.map(v => (
                                        <tr key={v} className={cn(
                                            'border-b border-slate-50',
                                            v === s.current ? 'bg-amber-50' : s.visited.includes(v) ? 'bg-indigo-50/40' : ''
                                        )}>
                                            <td className="px-4 py-1.5 font-mono font-bold text-slate-700">{v}</td>
                                            <td className="px-4 py-1.5 font-mono">
                                                <span className={cn(
                                                    'font-bold',
                                                    s.dist[v] === INF ? 'text-slate-300' : s.visited.includes(v) ? 'text-indigo-600' : 'text-amber-600'
                                                )}>
                                                    {s.dist[v] === INF ? '∞' : s.dist[v]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-1.5 font-mono text-xs text-slate-500">
                                                {s.dist[v] !== INF ? getPath(v).join('→') : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Bellman-Ford ──────────────────────────────────────────────────────────
    if (mode === 'bellman-ford') {
        const s = bfSteps[step];
        return (
            <div className="flex flex-col gap-4 items-center w-full">
                <Controls />
                <div className="flex gap-6 items-start flex-wrap justify-center">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-2">
                        <GraphSVG />
                    </div>
                    <div className="flex flex-col gap-3 min-w-[240px]">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 font-medium">
                            Iteration: {s.iteration} {s.relaxedEdge ? `· Relaxed: ${s.relaxedEdge}` : ''}
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Distances from A</span>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">Node</th>
                                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">Distance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {VERTEX_LABELS.map(v => {
                                        const isRelaxed = s.relaxedEdge?.endsWith(`→${v}`);
                                        return (
                                            <tr key={v} className={cn('border-b border-slate-50', isRelaxed ? 'bg-amber-50' : '')}>
                                                <td className="px-4 py-1.5 font-mono font-bold text-slate-700">{v}</td>
                                                <td className="px-4 py-1.5 font-mono">
                                                    <AnimatePresence mode="wait">
                                                        <motion.span
                                                            key={s.dist[v]}
                                                            initial={{ opacity: 0, y: -4 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={cn('font-bold', s.dist[v] === INF ? 'text-slate-300' : isRelaxed ? 'text-amber-600' : 'text-indigo-600')}
                                                        >
                                                            {s.dist[v] === INF ? '∞' : s.dist[v]}
                                                        </motion.span>
                                                    </AnimatePresence>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Floyd-Warshall ────────────────────────────────────────────────────────
    if (mode === 'floyd-warshall') {
        const s = fwSteps[step];
        return (
            <div className="flex flex-col gap-4 items-center w-full">
                <Controls />
                {s.k >= 0 && (
                    <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-xs text-violet-700 font-medium">
                        Intermediate vertex k = <strong>{VERTEX_LABELS[s.k]}</strong> · Improved dist[{VERTEX_LABELS[s.i]}][{VERTEX_LABELS[s.j]}]
                    </div>
                )}
                <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-500 mb-2 text-center">All-Pairs Shortest Path Matrix</div>
                    <table className="text-xs font-mono border-collapse">
                        <thead>
                            <tr>
                                <th className="w-8 h-8 text-slate-400 border border-slate-200 bg-slate-100"></th>
                                {VERTEX_LABELS.map(v => (
                                    <th key={v} className="w-12 h-8 text-center text-violet-700 font-bold border border-slate-200 bg-violet-50">{v}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {VERTEX_LABELS.map((v, i) => (
                                <tr key={v}>
                                    <td className="w-8 h-8 text-center text-violet-700 font-bold border border-slate-200 bg-violet-50">{v}</td>
                                    {s.matrix[i].map((val, j) => {
                                        const isActive = s.i === i && s.j === j && s.improved;
                                        return (
                                            <td key={j} className={cn(
                                                'w-12 h-8 text-center border border-slate-200 transition-colors',
                                                isActive ? 'bg-amber-100 text-amber-700 font-bold' :
                                                    i === j ? 'text-slate-300 bg-slate-50' :
                                                        val === INF ? 'text-slate-300' : 'text-slate-700 font-semibold bg-white'
                                            )}>
                                                {val === INF ? '∞' : val}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return null;
}
