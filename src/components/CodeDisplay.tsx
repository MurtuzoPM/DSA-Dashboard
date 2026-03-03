import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeDisplayProps {
  code: string;
  language?: string;
}

export function CodeDisplay({ code, language = 'javascript' }: CodeDisplayProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-200">
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-slate-400 ml-2">JavaScript</span>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          backgroundColor: '#1e1e1e',
        }}
        showLineNumbers
        lineNumberStyle={{
          color: '#6e7681',
          paddingRight: '1rem',
          minWidth: '2.5rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
