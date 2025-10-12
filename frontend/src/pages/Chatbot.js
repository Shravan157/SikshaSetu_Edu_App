import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatbotAPI } from '../utils/api';
import { toast } from 'react-toastify';
import {
  PaperAirplaneIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CpuChipIcon,
  DocumentDuplicateIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import hljs from 'highlight.js/lib/common';

// Code block renderer with copy button and syntax highlighting
const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = React.useState(false);
  const language = /language-(\w+)/.exec(className || '')?.[1];
  const raw = String(children).replace(/\n$/, '');

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      /* noop */
    }
  };

  if (inline) {
    return (
      <code className="bg-gray-800 text-gray-100 rounded px-1.5 py-0.5 text-[0.85em] font-mono" {...props}>
        {children}
      </code>
    );
  }

  let html;
  try {
    if (language && hljs.getLanguage(language)) {
      html = hljs.highlight(raw, { language }).value;
    } else {
      html = hljs.highlightAuto(raw).value;
    }
  } catch (e) {
    html = raw;
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800/80 backdrop-blur px-2 py-1 text-xs text-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? <CheckIcon className="w-4 h-4 text-emerald-600" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-auto rounded-md border border-gray-700 bg-gray-900 p-3 text-sm text-gray-100">
        <code className={className} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
};

// Build a formatting instruction to guide the AI response
const buildFormattingPrompt = (question) => {
  const instructionLines = [
    'Please answer in clean Markdown with this structure and style:',
    '- Start with a short summary (2–3 lines) in simple language.',
    '- Use clear section headings with emojis where relevant, for example: ',
    '  📘 Definition',
    '  ⚙️ How It Works',
    '  💡 Key Features / Benefits',
    '  🧠 Example / Use Case',
    '- Write in concise bullet points or short paragraphs (2–4 lines max per block).',
    '- Highlight key terms in **bold**.',
    '- Use a natural, conversational tone while keeping facts accurate.',
    '- If the answer is long, add a one-line TL;DR at the end.',
    '- For code, use fenced code blocks with language tags (e.g., ```js). Place opening and closing backticks (```) on their own lines, not inline with other text.'
  ];
  const instruction = instructionLines.join('\n');

  return instruction + '\n\n### Question\n' + question;
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your college portal assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Prefix the user question with formatting instructions so the AI responds in the desired structure
      const formattedPrompt = buildFormattingPrompt(userMessage.text);
      const response = await chatbotAPI.askQuestion(formattedPrompt);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast.error('Failed to get response from chatbot');
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await chatbotAPI.clearChat();
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your college portal assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date(),
        }
      ]);
      toast.success('Chat history cleared');
    } catch (error) {
      toast.error('Failed to clear chat history');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-gray-600">Ask me anything about the college portal</p>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="btn-secondary flex items-center"
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Clear Chat
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'justify-end space-x-reverse' : 'justify-start'
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' ? 'bg-primary-600' : 'bg-primary-100'
              }`}>
                {message.sender === 'user' ? (
                  <UserIcon className="w-5 h-5 text-white" />
                ) : (
                  <CpuChipIcon className="w-5 h-5 text-primary-600" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative max-w-2xl rounded-2xl shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white px-4 py-3'
                    : 'bg-primary-50 border border-primary-100 text-gray-900 pl-5 pr-4 py-4'
                }`}
              >
                {message.sender === 'bot' && (
                  <span className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-primary-400" />
                )}
                {message.sender === 'bot' ? (
                  <div className="prose prose-sm max-w-none text-gray-900">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-primary-700">{children}</strong>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-gray-900">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-gray-900">{children}</h3>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary-200 bg-primary-50/40 px-3 py-2 rounded-r-md text-gray-800">
                            {children}
                          </blockquote>
                        ),
                        code: CodeBlock,
                        table: ({ children }) => (
                          <div className="overflow-x-auto mb-3">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">{children}</table>
                          </div>
                        ),
                        th: ({ children }) => <th className="px-3 py-2 bg-gray-50 text-left font-semibold">{children}</th>,
                        td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.text}</p>
                )}
                <p
                  className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <CpuChipIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <LoadingSpinner size="small" text="" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question (e.g., How to view my attendance?)"
              className="flex-1 input-field"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Quick Questions:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "How do I check my attendance?",
            "Where can I find my results?",
            "How to view upcoming events?",
            "How to contact faculty?",
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(question)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
