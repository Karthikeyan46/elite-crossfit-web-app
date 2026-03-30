import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, Dumbbell } from 'lucide-react';
import { askCoach } from '../services/aiService';



export default function AiCoach({ open, onClose }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [thinking, setThinking]   = useState(false);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  async function send(text) {
    const userText = (text || input).trim();
    if (!userText || thinking) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setThinking(true);

    try {
      // Pass all prior turns (excluding the initial model greeting) as history
      const history = newMessages.slice(1).map(m => ({ role: m.role, text: m.text }));
      const reply = await askCoach(userText, history.slice(0, -1)); // exclude the just-added user msg
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: "Oops, I had a hiccup! Try again in a sec 🙏" }]);
    } finally {
      setThinking(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 900,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed',
        bottom: '2rem', right: '2rem',
        zIndex: 901,
        width: '400px',
        maxWidth: '90vw',
        background: 'var(--color-bg-secondary, #141414)',
        borderRadius: '20px',
        border: '1px solid rgba(163,230,53,0.15)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(163,230,53,0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '50vh',
        maxHeight: '500px',
        animation: 'slideUpDrawer 0.32s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(163,230,53,0.12)',
            border: '1px solid rgba(163,230,53,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={20} color="var(--color-primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>AI Coach</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              Online · Fitness &amp; Nutrition
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '6px 8px', cursor: 'pointer', color: 'var(--color-text-dim)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 16px 8px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {msg.role === 'model' && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(163,230,53,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 8, marginTop: 2,
                }}>
                  <Dumbbell size={13} color="var(--color-primary)" />
                </div>
              )}
              <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user'
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                background: msg.role === 'user'
                  ? 'var(--color-primary)'
                  : 'rgba(255,255,255,0.055)',
                color: msg.role === 'user' ? '#000' : '#f5f2ec',
                fontSize: 12.5,
                lineHeight: 1.5,
                fontWeight: msg.role === 'user' ? 600 : 400,
                border: msg.role === 'model' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {thinking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(163,230,53,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Dumbbell size={13} color="var(--color-primary)" />
              </div>
              <div style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.055)',
                borderRadius: '16px 16px 16px 4px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 1, 2].map(d => (
                  <span key={d} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--color-primary)',
                    opacity: 0.7,
                    animation: `coachDot 1.2s ${d * 0.2}s infinite ease-in-out`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>


        {/* Input row */}
        <div style={{
          display: 'flex', gap: 10,
          padding: '8px 16px max(16px, env(safe-area-inset-bottom))',
          flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about workouts or nutrition…"
            disabled={thinking}
            style={{
              flex: 1, padding: '9px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, color: '#fff', fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || thinking}
            style={{
              width: 44, height: 44, borderRadius: 13,
              background: input.trim() && !thinking ? 'var(--color-primary)' : 'rgba(163,230,53,0.15)',
              border: 'none', cursor: input.trim() && !thinking ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, transform 0.1s',
              flexShrink: 0,
            }}
          >
            {thinking
              ? <Loader2 size={18} className="animate-spin" color="var(--color-primary)" />
              : <Send size={18} color={input.trim() ? '#000' : 'var(--color-primary)'} />
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUpDrawer {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes coachDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%            { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
