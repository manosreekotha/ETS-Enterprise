import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { askCopilot } from '../../api/client';
import type { CopilotResponse } from '../../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  response?: CopilotResponse;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **ETS AI Workforce Copilot**. Ask me any analytical questions about headcount, salaries, skills, leaves, or department trends across all 590 employees.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "What is the total headcount and gender split?",
    "Show workforce distribution by location",
    "What is the average CTC and highest earner?",
    "Which technical skills are most common?",
    "How many leaves were logged in 2024?",
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askCopilot(q, activeTab);
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.answer,
        response: res,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error connecting to the analytics engine.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="h-13 px-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">ETS AI Copilot</h3>
            <p className="text-[10px] text-purple-700 font-semibold">Workforce Intelligence Agent</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2.5 bg-slate-50/40">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col gap-1 ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl text-xs max-w-[90%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white font-medium rounded-br-none shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
              }`}
            >
              {/* Intent Badge for Assistant */}
              {m.role === 'assistant' && m.response?.intent && (
                <div className="mb-1.5 flex items-center justify-between gap-1 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold tracking-tight">
                    [{m.response.intent}]
                  </span>
                  {m.response.confidence && (
                    <span className="text-[9px] text-slate-600 font-medium">
                      {(m.response.confidence * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>
              )}

              <p className="whitespace-pre-wrap">{m.content}</p>

              {/* Insights List */}
              {m.response?.insights && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-700">
                  <span className="font-bold text-purple-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-600" /> Key Insights:
                  </span>
                  {m.response.insights.map((ins, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{ins}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Chart Data in Copilot */}
              {m.response?.chart_data && m.response.chart_data.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100 h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={m.response.chart_data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '10px' }} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Source API Reference */}
              {m.role === 'assistant' && m.response?.source && (
                <div className="mt-1.5 text-[9px] text-slate-600 font-mono flex items-center justify-end gap-1 border-t border-slate-100 pt-1">
                  <span>Source: {m.response.source}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs p-2 bg-white rounded-xl w-fit border border-slate-200 shadow-xs">
            <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing workforce records...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="px-3 py-1.5 border-t border-slate-200 bg-white flex flex-wrap gap-1 shrink-0">
        {samplePrompts.slice(0, 3).map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[10px] text-slate-700 bg-slate-50 border border-slate-200 hover:text-cyan-700 hover:bg-cyan-50 hover:border-cyan-200 rounded-full px-2 py-0.5 transition-colors truncate max-w-full font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-1.5 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask AI Copilot about workforce data..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};
