import { useState, useRef, useEffect } from 'react';
import { api, ApiError } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import type { ChatMessage } from '../../types';

export default function HelpChatWidget() {
  const { currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Bravford AI 👋 Ask me anything about admissions, the student portal, or our school.",
      at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, sending, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: text, at: new Date().toISOString() }]);
    setSending(true);
    try {
      const res = await api.post<{ conversationId: string; reply: string }>('/chat', {
        conversationId,
        message: text,
        guestName: currentUser?.role === 'student' ? currentUser.name : '',
      });
      setConversationId(res.conversationId);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply, at: new Date().toISOString() }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the help desk. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close help chat' : 'Open help chat'}
        title="Ask Bravford AI"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(200,146,42,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
              🤖
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: '1rem' }}>Bravford AI Help Desk</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)' }}>Usually replies instantly</div>
            </div>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>{m.content}</div>
            ))}
            {sending && (
              <div className="chat-bubble assistant">
                <div className="chat-typing"><span /><span /><span /></div>
              </div>
            )}
            {error && <div className="alert alert-error" style={{ fontSize: '0.78rem' }}>{error}</div>}
          </div>

          <div className="chat-input-row">
            <input
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              disabled={sending}
            />
            <button onClick={send} disabled={sending || !input.trim()} aria-label="Send">➤</button>
          </div>
        </div>
      )}
    </>
  );
}
