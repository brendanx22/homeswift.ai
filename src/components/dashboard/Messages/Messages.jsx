import React from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Send, Image as ImageIcon, FileText, Download, X, Check, CheckCheck } from 'lucide-react';

// Simple in-memory mock socket for demo
const subscribers = new Set();
function publishMock(message) {
  subscribers.forEach((cb) => cb(message));
}

const MessageBubble = ({ message }) => {
  const isMe = message.sender === 'me';
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>      
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm border ${isMe ? 'bg-[#FF6B35] text-white border-[#FF6B35]' : 'bg-white text-[#2C3E50] border-gray-200'}`}>
        {message.text && (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</div>
        )}
        {message.files?.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.files.map((f) => (
              <a key={f.id} href={f.url} download={f.name} target="_blank" rel="noreferrer" className={`flex items-center gap-2 text-sm group ${isMe ? 'text-white/90 hover:text-white' : 'text-[#2C3E50] hover:text-[#FF6B35]'}`}>
                {f.type.startsWith('image/') ? (
                  <img src={f.url} alt={f.name} className="h-20 w-28 object-cover rounded-md border border-white/20" />
                ) : (
                  <div className={`h-10 w-10 rounded-md grid place-items-center border ${isMe ? 'border-white/20' : 'border-gray-200'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{f.name}</div>
                  <div className={`text-xs ${isMe ? 'text-white/80' : 'text-gray-500'}`}>{Math.ceil(f.size / 1024)} KB</div>
                </div>
                <Download className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        )}
        <div className={`mt-1 text-[10px] ${isMe ? 'text-white/80' : 'text-gray-500'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isMe && (
            <span className="ml-1 inline-flex align-middle">
              {message.status === 'sent' && <Check className="h-3 w-3" />}
              {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const AttachmentPreview = ({ files, onRemove }) => {
  if (files.length === 0) return null;
  return (
    <div className="px-3 pb-2">
      <div className="flex gap-3 overflow-x-auto">
        {files.map((f) => (
          <div key={f.id} className="relative border border-gray-200 rounded-lg p-2 bg-white min-w-[140px]">
            <button onClick={() => onRemove(f.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 grid place-items-center">
              <X className="h-3 w-3" />
            </button>
            {f.type.startsWith('image/') ? (
              <img src={f.url} alt={f.name} className="h-24 w-full object-cover rounded" />
            ) : (
              <div className="h-24 w-full grid place-items-center bg-gray-50 rounded border">
                <FileText className="h-6 w-6 text-gray-500" />
              </div>
            )}
            <div className="mt-1 text-xs font-medium truncate max-w-[120px]">{f.name}</div>
            <div className="text-[10px] text-gray-500">{Math.ceil(f.size / 1024)} KB</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Messages = () => {
  const [messages, setMessages] = React.useState(() => {
    const seed = [
      { id: 'm1', sender: 'other', text: 'Hi! I saw your listing. Is the apartment still available?', createdAt: Date.now() - 1000 * 60 * 20 },
      { id: 'm2', sender: 'me', text: 'Hello! Yes, it is available. Would you like to schedule a viewing?', status: 'delivered', createdAt: Date.now() - 1000 * 60 * 18 },
    ];
    return seed;
  });
  const [text, setText] = React.useState('');
  const [attachments, setAttachments] = React.useState([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const inputRef = React.useRef(null);
  const scrollerRef = React.useRef(null);

  React.useEffect(() => {
    const cb = (m) => setMessages((prev) => [...prev, m]);
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  }, []);

  React.useEffect(() => {
    // Auto-scroll to bottom when messages change
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const onFiles = (filesList) => {
    const maxFiles = 5;
    const selected = Array.from(filesList).slice(0, maxFiles);
    const valid = [];
    for (const file of selected) {
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        alert(`File too large: ${file.name}`);
        continue;
      }
      const id = `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`;
      const url = URL.createObjectURL(file);
      valid.push({ id, name: file.name, size: file.size, type: file.type || 'application/octet-stream', url });
    }
    setAttachments((prev) => [...prev, ...valid]);
  };

  const handlePaste = (e) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    const files = [];
    for (const item of items) {
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) onFiles(files);
  };

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    const msg = {
      id: `m-${Date.now()}`,
      sender: 'me',
      text: trimmed || '',
      files: attachments,
      status: 'sent',
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setText('');
    setAttachments([]);
    inputRef.current?.focus();

    // simulate delivery status and agent reply
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: 'delivered' } : m)));
    }, 400);

    setIsTyping(true);
    setTimeout(() => {
      const reply = {
        id: `r-${Date.now()}`,
        sender: 'other',
        text: attachments.length > 0 ? 'Received your file(s). Thanks! When are you available for a tour?' : 'Great! I am available tomorrow at 2 PM. Does that work?',
        createdAt: Date.now() + 500,
      };
      publishMock(reply);
      setIsTyping(false);
    }, 1200);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header aligned with dashboard style */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#FF6B35]">Messages</h1>
          <div className="text-sm text-gray-600">Mock Agent • Online</div>
        </div>
      </header>

      <div className="flex-1 pt-[72px]">
        <main className="max-w-5xl mx-auto h-[calc(100vh-72px)] px-4 sm:px-6">
          <div className="h-full grid grid-rows-[1fr_auto]">
            {/* Messages area */}
            <div ref={scrollerRef} className="overflow-y-auto border-x border-t border-gray-200 rounded-t-2xl p-4 bg-gray-50" onDrop={onDrop} onDragOver={onDragOver}>
              <div className="max-w-3xl mx-auto">
                {/* Day divider example */}
                <div className="text-center text-xs text-gray-500 my-2">Today</div>
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-3">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0ms'}} />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '100ms'}} />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '200ms'}} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Composer */}
            <div className="border border-gray-200 rounded-b-2xl bg-white">
              <AttachmentPreview files={attachments} onRemove={removeAttachment} />
              <div className="flex items-end gap-2 p-3">
                <label className="cursor-pointer text-gray-600 hover:text-[#FF6B35] p-2 rounded-lg hover:bg-gray-100">
                  <input type="file" className="hidden" multiple onChange={(e) => onFiles(e.target.files || [])} />
                  <Paperclip className="h-5 w-5" />
                </label>
                <label className="cursor-pointer text-gray-600 hover:text-[#FF6B35] p-2 rounded-lg hover:bg-gray-100">
                  <input type="file" accept="image/*" className="hidden" multiple onChange={(e) => onFiles(e.target.files || [])} />
                  <ImageIcon className="h-5 w-5" />
                </label>
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') send();
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    onPaste={handlePaste}
                    rows={1}
                    placeholder="Write a message..."
                    className="w-full resize-none outline-none rounded-lg border border-gray-200 p-2 text-sm focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <button
                  onClick={send}
                  disabled={!text.trim() && attachments.length === 0}
                  className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 hover:brightness-95"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
              <div className="px-3 pb-3 text-[11px] text-gray-500">
                Press Enter to send • Shift+Enter for new line • Ctrl/Cmd+Enter also sends
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;


