import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store';
import { ChatMessage } from '../../types/game';
import { GameSocket } from '../../hooks/useSocket';
import './Chat.css';

interface ChatProps {
  gameId: string;
  socket: GameSocket | null;
}

const Chat: React.FC<ChatProps> = ({ gameId, socket }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<(ChatMessage & { authorId: string })[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage & { authorId: string }) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim() || !user) return;

    socket.emit('send-message', {
      gameId,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={`${message.timestamp.toString()}-${index}`}
            className={`message ${message.authorId === user?._id ? 'own' : 'other'}`}
          >
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!socket}
        />
        <button type="submit" disabled={!socket || !newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
