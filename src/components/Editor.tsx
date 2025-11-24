import React, { useRef, useState, useEffect } from "react";

export default function Editor() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const minimapRef = useRef<HTMLPreElement>(null);
  const [openFile, setOpenFile] = useState(null);
  const [lines, setLines] = useState<string[]>([""]);

  const [tabs] = useState([
    { id: 1, name: "App.tsx", content: `import React from 'react';

const App = () => {
  return <div>Hello World</div>;
};

export default App;` },
    { id: 2, name: "index.tsx", content: `import React from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(<App />);` }
  ]);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    const file = tabs.find(t => t.id === activeTab);
    if (file && inputRef.current) {
      inputRef.current.value = file.content;
      const evt = new Event("input", { bubbles: true });
      inputRef.current.dispatchEvent(evt);
    }
  }, [activeTab]);

  const highlight = (text: string) => {
    let escaped = text.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const keywords = ["const", "let", "var", "function", "return", "if", "else", "for", "while", "import", "from", "export", "default"];
    keywords.forEach(kw => {
      escaped = escaped.split(kw).join(`<span class='text-blue-400'>${kw}</span>`);
    });

    return escaped.split('\n').join('<br/>');
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const text = (e.target as HTMLTextAreaElement).value;
    setLines(text.split('\n'));
    setActiveLine((e.target as HTMLTextAreaElement).value.substr(0, (e.target as HTMLTextAreaElement).selectionStart).split('\n').length - 1);

    if (highlightRef.current) highlightRef.current.innerHTML = highlight(text);
    if (minimapRef.current) minimapRef.current.innerText = text;
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      const text = inputRef.current.value || tabs[0].content;
      setLines(text.split('\n'));
      if (highlightRef.current) highlightRef.current.innerHTML = highlight(text);
      if (minimapRef.current) minimapRef.current.innerText = text;
    }
  }, []);

  return (
    <div className="w-full h-screen flex bg-zinc-900 text-zinc-200 font-mono">

      {/* Activity bar */}
      <div className="w-14 bg-zinc-800 flex flex-col items-center py-3 gap-3 border-r border-zinc-700">
        <button className="w-10 h-10 rounded-md hover:bg-zinc-700">☰</button>
        <button className="w-10 h-10 rounded-md hover:bg-zinc-700">▣</button>
      </div>

      {/* Explorer */}
      <aside className="w-64 bg-zinc-850 border-r border-zinc-700 p-3">
        <div className="text-xs text-zinc-400 mb-2">EXPLORER</div>
        <div className="space-y-1 text-sm">
          <div className="px-2 py-1 rounded hover:bg-zinc-700">src</div>
          <div className="px-2 py-1 rounded hover:bg-zinc-700">package.json</div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col">

        {/* Tabs */}
        <div className="h-10 bg-zinc-800 border-b border-zinc-700 flex items-center px-3 gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative px-3 py-1 group ${t.id === activeTab ? "text-white" : "text-zinc-400"}`}
            >
              {t.name}
              <span
                className={`absolute bottom-0 left-0 h-[2px] w-full bg-blue-400 rounded transition-all duration-300 ${t.id === activeTab ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
              />
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* Line numbers */}
          <div className="bg-zinc-900 text-zinc-600 select-none py-4 px-3 text-right w-16 overflow-auto relative">
            {lines.map((_, i) => (
              <div
                key={i}
                className={`h-5 leading-5 ${activeLine === i ? "text-blue-400" : ""}`}
              >
                {i + 1}
              </div>
            ))}
          </div>{/* Editor wrapper (so absolute layers only cover editor, not minimap) */}
          <div className="relative flex-1 overflow-hidden bg-zinc-950">

            {/* Active line highlight */}
            <div className="absolute left-0 right-0 bg-zinc-700/20 pointer-events-none" style={{ top: activeLine * 20, height: 20 }} />

            {/* Highlight layer */}
            <pre
              ref={highlightRef}
              className="absolute inset-0 p-4 whitespace-pre-wrap break-words text-sm leading-5 pointer-events-none text-zinc-200 font-mono antialiased"
              style={{ fontVariantLigatures: 'none' }}
            />

            {/* Textarea */}
            <textarea
              ref={inputRef}
              className="absolute inset-0 p-4 bg-transparent text-transparent caret-white resize-none outline-none whitespace-pre-wrap break-words overflow-auto text-sm leading-5 font-mono antialiased"
              style={{ fontVariantLigatures: 'none' }}
              onInput={handleInput}
              onScroll={handleScroll}
              spellCheck={false}
            />

          </div>

          {/* Minimap */}
          <div className="w-28 bg-zinc-900 border-l border-zinc-700 relative overflow-hidden">
            <pre
              ref={minimapRef}
              className="absolute text-[4px] leading-[6px] opacity-60 p-1 whitespace-pre-wrap text-zinc-400"
            />
            <div className="absolute left-0 right-0 bg-blue-400/20 rounded h-10 top-0" />
          </div>
        </div>

        {/* Status bar */}
        <div className="h-8 bg-zinc-800 border-t border-zinc-700 flex items-center px-3 text-xs text-zinc-400">
          Ln {activeLine + 1}
        </div>
      </div>
    </div>
  );
}
