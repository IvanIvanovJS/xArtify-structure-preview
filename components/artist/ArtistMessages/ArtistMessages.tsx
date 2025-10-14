"use client";

import { useState, useEffect, useRef, JSX } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import Image from "next/image";

import "./styles/artist-messages.css";

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderType: 'USER' | 'ARTIST';
    senderName: string;
    senderImage: string | null;
    createdAt: string;
    isRead: boolean;
}

interface Conversation {
    id: string;
    participant: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
    lastMessage: {
        content: string;
        createdAt: string;
        senderType: 'USER' | 'ARTIST';
    } | null;
    unreadCount: number;
    updatedAt: string;
}

interface MessagesData {
    conversations: Conversation[];
    total: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ArtistMessages(): JSX.Element {
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: conversationsData, error: conversationsError, mutate: mutateConversations } = useSWR<MessagesData>('/api/artist/messages', fetcher, {
        refreshInterval: 30000
    });

    const { data: messagesData, error: messagesError, mutate: mutateMessages } = useSWR<{ messages: Message[] }>(
        selectedConversation ? `/api/artist/messages/${selectedConversation}` : null,
        fetcher,
        {
            refreshInterval: 5000
        }
    );

    useEffect(() => {
        if (messagesData) {
            setMessages(messagesData.messages);
        }
    }, [messagesData]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleConversationSelect = async (conversationId: string) => {
        setSelectedConversation(conversationId);
        setIsLoading(true);

        try {
            // Mark messages as read
            await fetch(`/api/artist/messages/${conversationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAsRead: true })
            });

            // Refresh conversations to update unread counts
            mutateConversations();
        } catch (error) {
            console.error('Error marking messages as read:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || isSending) return;

        setIsSending(true);
        const messageContent = newMessage.trim();
        setNewMessage('');

        try {
            const response = await fetch('/api/artist/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: selectedConversation,
                    content: messageContent
                })
            });

            if (response.ok) {
                // Refresh messages
                mutateMessages();
                mutateConversations();
            } else {
                const error = await response.json();
                console.error('Error sending message:', error.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString('bg-BG', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' });
        }
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

        if (diffInMinutes < 1) {
            return 'сега';
        } else if (diffInMinutes < 60) {
            return `${Math.floor(diffInMinutes)} мин`;
        } else if (diffInMinutes < 1440) { // 24 hours
            return `${Math.floor(diffInMinutes / 60)} ч`;
        } else {
            return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' });
        }
    };

    if (conversationsError) {
        return (
            <div className="messages-error">
                <h2>Грешка при зареждане на съобщенията</h2>
                <p>Моля, опитайте отново по-късно.</p>
            </div>
        );
    }

    if (!conversationsData) {
        return (
            <div className="messages-loading">
                <div className="messages-spinner"></div>
                <p>Зареждане на съобщенията...</p>
            </div>
        );
    }

    const selectedConversationData = conversationsData.conversations.find(
        conv => conv.id === selectedConversation
    );

    return (
        <div className="artist-messages">
            <div className="messages-header">
                <h1>Съобщения</h1>
                <p>Управлявайте комуникацията с клиентите си</p>
            </div>

            <div className="messages-container">
                {/* Conversations List */}
                <div className="conversations-sidebar">
                    <div className="conversations-header">
                        <h2>Разговори ({conversationsData.total})</h2>
                    </div>

                    <div className="conversations-list">
                        {conversationsData.conversations.length === 0 ? (
                            <div className="conversations-empty">
                                <p>Няма съобщения</p>
                            </div>
                        ) : (
                            conversationsData.conversations.map((conversation) => (
                                <motion.div
                                    key={conversation.id}
                                    className={`conversation-item ${selectedConversation === conversation.id ? 'active' : ''}`}
                                    onClick={() => handleConversationSelect(conversation.id)}
                                    whileHover={{ backgroundColor: 'var(--color-white-1)' }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="conversation-avatar">
                                        {conversation.participant.image ? (
                                            <Image
                                                src={conversation.participant.image}
                                                alt={conversation.participant.name}
                                                width={48}
                                                height={48}
                                                className="avatar-image"
                                            />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {conversation.participant.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {conversation.unreadCount > 0 && (
                                            <span className="unread-badge">
                                                {conversation.unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    <div className="conversation-content">
                                        <div className="conversation-header">
                                            <h3>{conversation.participant.name}</h3>
                                            <span className="conversation-time">
                                                {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ''}
                                            </span>
                                        </div>

                                        <div className="conversation-preview">
                                            {conversation.lastMessage ? (
                                                <p className={conversation.unreadCount > 0 ? 'unread' : ''}>
                                                    {conversation.lastMessage.senderType === 'ARTIST' ? 'Вие: ' : ''}
                                                    {conversation.lastMessage.content}
                                                </p>
                                            ) : (
                                                <p className="no-messages">Няма съобщения</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="messages-area">
                    {selectedConversation ? (
                        <>
                            {/* Messages Header */}
                            <div className="messages-chat-header">
                                <div className="chat-participant">
                                    <div className="chat-avatar">
                                        {selectedConversationData?.participant.image ? (
                                            <Image
                                                src={selectedConversationData.participant.image}
                                                alt={selectedConversationData.participant.name}
                                                width={40}
                                                height={40}
                                                className="avatar-image"
                                            />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {selectedConversationData?.participant.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="chat-info">
                                        <h3>{selectedConversationData?.participant.name}</h3>
                                        <p>{selectedConversationData?.participant.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="messages-list">
                                {isLoading ? (
                                    <div className="messages-loading-inline">
                                        <div className="messages-spinner"></div>
                                    </div>
                                ) : messagesError ? (
                                    <div className="messages-error-inline">
                                        <p>Грешка при зареждане на съобщенията</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="messages-empty">
                                        <p>Няма съобщения в този разговор</p>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            className={`message-item ${message.senderType === 'ARTIST' ? 'sent' : 'received'}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="message-content">
                                                <div className="message-bubble">
                                                    <p>{message.content}</p>
                                                </div>
                                                <div className="message-meta">
                                                    <span className="message-time">
                                                        {formatMessageTime(message.createdAt)}
                                                    </span>
                                                    {message.senderType === 'ARTIST' && (
                                                        <span className={`message-status ${message.isRead ? 'read' : 'sent'}`}>
                                                            {message.isRead ? '✓✓' : '✓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="message-input-form">
                                <div className="message-input-container">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Напишете съобщение..."
                                        className="message-input"
                                        disabled={isSending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className="message-send-btn"
                                    >
                                        {isSending ? (
                                            <div className="send-spinner"></div>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="messages-placeholder">
                            <div className="placeholder-content">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="placeholder-icon">
                                    <path
                                        d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <h3>Изберете разговор</h3>
                                <p>Изберете разговор от списъка, за да започнете да четете и отговаряте на съобщения.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
