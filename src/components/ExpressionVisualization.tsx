import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowRight, Play, Info } from 'lucide-react';

export type ExprMode = 'prefix' | 'postfix' | 'evaluate';

interface Step {
    token: string;
    action: string;
    stackState: string[];
    output: string;
}

interface Result {
    steps: Step[];
    outputStr: string;       // postfix / prefix string
    evalResult: number | null; // only for evaluate mode
    error: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OPERATORS = new Set(['+', '-', '*', '/']);

function isOp(t: string): boolean {
    return OPERATORS.has(t);
}

function prec(op: string): number {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
}

function calc(op: string, a: number, b: number): number {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') return b !== 0 ? Math.floor(a / b) : NaN;
    return NaN;
}

// ─── Infix → Postfix (Shunting-Yard) ─────────────────────────────────────────

function shuntingYard(tokens: string[], rightAssoc = false): { steps: Step[]; out: string[] } {
    const stack: string[] = [];
    const out: string[] = [];
    const steps: Step[] = [];

    for (const token of tokens) {
        const isOperand = !isOp(token) && token !== '(' && token !== ')';

        if (isOperand) {
            out.push(token);
            steps.push({
                token,
                action: `Operand '${token}' → append to output`,
                stackState: [...stack],
                output: out.join(' '),
            });
        } else if (token === '(') {
            stack.push(token);
            steps.push({ token, action: `'(' → push to stack`, stackState: [...stack], output: out.join(' ') });
        } else if (token === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') {
                out.push(stack.pop()!);
            }
            stack.pop(); // discard '('
            steps.push({ token, action: `')' → pop stack until '('`, stackState: [...stack], output: out.join(' ') });
        } else if (isOp(token)) {
            const shouldPop = (top: string) =>
                isOp(top) && (rightAssoc ? prec(top) > prec(token) : prec(top) >= prec(token));

            while (stack.length && stack[stack.length - 1] !== '(' && shouldPop(stack[stack.length - 1])) {
                out.push(stack.pop()!);
            }
            stack.push(token);
            steps.push({
                token,
                action: `Operator '${token}' → push to stack (prec ${prec(token)})`,
                stackState: [...stack],
                output: out.join(' '),
            });
        }
    }

    while (stack.length) {
        out.push(stack.pop()!);
    }
    steps.push({ token: '', action: 'End: flush remaining operators from stack', stackState: [], output: out.join(' ') });

    return { steps, out };
}

// ─── Infix → Prefix ──────────────────────────────────────────────────────────

function convertToPrefix(expression: string): Result {
    const tokens = expression.trim().split(/\s+/);
    if (tokens.length === 0) return { steps: [], outputStr: '', evalResult: null, error: 'Empty input' };

    // 1. Reverse tokens, swap brackets
    const reversed = [...tokens].reverse().map(t => (t === '(' ? ')' : t === ')' ? '(' : t));

    // 2. Postfix on reversed (right-associative)
    const { steps, out } = shuntingYard(reversed, true);

    // 3. Reverse postfix → prefix
    const prefix = [...out].reverse();

    const allSteps: Step[] = [
        { token: '', action: `Input (infix): ${tokens.join(' ')}`, stackState: [], output: '' },
        { token: '', action: `Step 1 — Reverse & swap brackets: ${reversed.join(' ')}`, stackState: [], output: '' },
        { token: '', action: 'Step 2 — Apply Shunting-Yard on reversed expression:', stackState: [], output: '' },
        ...steps,
        {
            token: '',
            action: `Step 3 — Reverse output → Prefix (Polish): ${prefix.join(' ')}`,
            stackState: [],
            output: prefix.join(' '),
        },
    ];

    return { steps: allSteps, outputStr: prefix.join(' '), evalResult: null, error: null };
}

// ─── Infix → Postfix ─────────────────────────────────────────────────────────

function convertToPostfix(expression: string): Result {
    const tokens = expression.trim().split(/\s+/);
    if (tokens.length === 0) return { steps: [], outputStr: '', evalResult: null, error: 'Empty input' };

    const { steps, out } = shuntingYard(tokens, false);

    const allSteps: Step[] = [
        { token: '', action: `Input (infix): ${tokens.join(' ')}`, stackState: [], output: '' },
        { token: '', action: 'Apply Shunting-Yard algorithm:', stackState: [], output: '' },
        ...steps,
    ];

    return { steps: allSteps, outputStr: out.join(' '), evalResult: null, error: null };
}

// ─── Infix → Evaluate (postfix + numeric eval) ───────────────────────────────

function evaluateInfix(expression: string): Result {
    const tokens = expression.trim().split(/\s+/);
    if (tokens.length === 0) return { steps: [], outputStr: '', evalResult: null, error: 'Empty input' };

    // Check all operands are numbers
    for (const t of tokens) {
        if (!isOp(t) && t !== '(' && t !== ')' && isNaN(Number(t))) {
            return { steps: [], outputStr: '', evalResult: null, error: `'${t}' is not a number. Use numeric values for Evaluation mode.` };
        }
    }

    // Step 1: infix → postfix
    const { steps: convSteps, out: postfix } = shuntingYard(tokens, false);
    const postfixStr = postfix.join(' ');

    // Step 2: evaluate postfix
    const evalStack: string[] = [];
    const evalSteps: Step[] = [];

    for (const token of postfix) {
        if (isOp(token)) {
            const b = evalStack.pop();
            const a = evalStack.pop();
            if (a === undefined || b === undefined) {
                return { steps: evalSteps, outputStr: postfixStr, evalResult: null, error: 'Invalid expression structure' };
            }
            const res = calc(token, Number(a), Number(b));
            evalStack.push(String(res));
            evalSteps.push({ token, action: `Pop ${a} & ${b} → ${a} ${token} ${b} = ${res}`, stackState: [...evalStack], output: String(res) });
        } else {
            evalStack.push(token);
            evalSteps.push({ token, action: `Push '${token}'`, stackState: [...evalStack], output: '' });
        }
    }

    const evalResult = evalStack.length === 1 ? Number(evalStack[0]) : null;

    const allSteps: Step[] = [
        { token: '', action: `Input (infix): ${expression}`, stackState: [], output: '' },
        { token: '', action: '── Phase 1: Infix → Postfix ──────────────', stackState: [], output: '' },
        ...convSteps,
        { token: '', action: `── Phase 2: Evaluate Postfix: ${postfixStr} ──`, stackState: [], output: '' },
        ...evalSteps,
    ];

    return { steps: allSteps, outputStr: postfixStr, evalResult, error: null };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ExpressionVisualizationProps {
    mode: ExprMode;
}

const modeConfig: Record<ExprMode, { label: string; resultLabel: string; placeholder: string; hint: string; color: string }> = {
    prefix: {
        label: 'Infix Expression',
        resultLabel: 'Prefix (Polish) Result',
        placeholder: 'A + B   or   ( A + B ) * C',
        hint: 'Enter a normal infix expression and this converts it to Prefix (Polish) Notation.',
        color: 'from-orange-500 to-yellow-400',
    },
    postfix: {
        label: 'Infix Expression',
        resultLabel: 'Postfix (RPN) Result',
        placeholder: 'A + B   or   3 + 4 * 2',
        hint: 'Enter a normal infix expression and this converts it to Postfix (Reverse Polish) Notation.',
        color: 'from-purple-500 to-blue-500',
    },
    evaluate: {
        label: 'Infix Expression (numbers only)',
        resultLabel: 'Evaluation Result',
        placeholder: '3 + 4 * 2   or   ( 5 + 3 ) * 2',
        hint: 'Enter an infix expression with numbers. It first converts to postfix, then evaluates.',
        color: 'from-emerald-500 to-teal-400',
    },
};

const stepColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-cyan-500'];

export function ExpressionVisualization({ mode }: ExpressionVisualizationProps) {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<Result | null>(null);

    const cfg = modeConfig[mode];

    const handleEvaluate = () => {
        if (!input.trim()) return;
        let r: Result;
        if (mode === 'prefix') r = convertToPrefix(input);
        else if (mode === 'postfix') r = convertToPostfix(input);
        else r = evaluateInfix(input);
        setResult(r);
    };

    const displaySteps = result?.steps.filter(s => s.action) ?? [];

    return (
        <div className="w-full space-y-5">
            {/* Hint */}
            <div className="flex items-start gap-2 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <span>{cfg.hint}</span>
            </div>

            {/* Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cfg.label}</label>
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleEvaluate()}
                        placeholder={cfg.placeholder}
                        className="font-mono text-sm flex-1"
                    />
                    <Button onClick={handleEvaluate} className="flex items-center gap-1.5 flex-shrink-0 bg-slate-900 hover:bg-slate-700">
                        <Play className="w-3.5 h-3.5" />
                        Evaluate
                    </Button>
                </div>
                <p className="text-xs text-slate-400">
                    Separate every token with spaces — e.g. <code className="bg-slate-100 px-1 rounded">{cfg.placeholder.split('  or  ')[0]}</code>
                </p>
            </div>

            {/* Error */}
            {result?.error && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"
                >
                    ⚠ {result.error}
                </motion.div>
            )}

            {/* Result Banner */}
            <AnimatePresence>
                {result && !result.error && (
                    <motion.div
                        key={result.outputStr}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            'flex items-center gap-4 px-5 py-4 rounded-xl shadow-md bg-gradient-to-r text-white',
                            cfg.color
                        )}
                    >
                        <ArrowRight className="w-5 h-5 flex-shrink-0" />
                        <div className="min-w-0">
                            <div className="text-xs font-medium opacity-75 mb-0.5">{cfg.resultLabel}</div>
                            <div className="font-mono font-bold text-xl tracking-widest truncate">{result.outputStr}</div>
                            {result.evalResult !== null && (
                                <div className="text-sm font-semibold opacity-90 mt-1">
                                    Final value = <span className="text-2xl font-bold">{result.evalResult}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Steps + Stack */}
            {displaySteps.length > 0 && !result?.error && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                    {/* Steps — wider */}
                    <div className="md:col-span-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Step-by-Step</h4>
                        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                            {displaySteps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                                    className={cn(
                                        'flex gap-2 items-start text-xs rounded-lg px-3 py-2 border',
                                        step.token === '' ? 'bg-slate-50 border-slate-100 text-slate-400 italic' : 'bg-white border-slate-100 text-slate-700'
                                    )}
                                >
                                    {step.token !== '' && (
                                        <span className={cn(
                                            'w-5 h-5 rounded flex-shrink-0 flex items-center justify-center font-bold text-white text-xs mt-0.5',
                                            isOp(step.token) ? 'bg-purple-500' : 'bg-blue-500'
                                        )}>
                                            {step.token}
                                        </span>
                                    )}
                                    <div>
                                        <span>{step.action}</span>
                                        {step.output && (
                                            <div className="mt-0.5 font-mono text-emerald-600 font-medium">→ {step.output}</div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Final Stack State — narrower */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Final Stack State</h4>
                        <div className="flex flex-col items-center">
                            <div className="w-36 min-h-[140px] border-2 border-slate-200 border-t-0 rounded-b-xl bg-slate-50 relative flex flex-col-reverse items-stretch justify-start p-2 gap-1">
                                {displaySteps[displaySteps.length - 1]?.stackState.length === 0 && (
                                    <span className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">Empty</span>
                                )}
                                {displaySteps[displaySteps.length - 1]?.stackState.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={cn(
                                            'py-2 px-3 rounded-lg text-center font-mono text-sm font-bold text-white shadow',
                                            stepColors[i % stepColors.length]
                                        )}
                                    >
                                        {item}
                                    </motion.div>
                                ))}
                            </div>
                            {(displaySteps[displaySteps.length - 1]?.stackState.length ?? 0) > 0 && (
                                <p className="text-xs text-slate-400 mt-1">↑ TOP</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
