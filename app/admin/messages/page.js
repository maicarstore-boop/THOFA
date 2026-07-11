'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminMessages() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    read: 0,
    unread: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    fetchMessages();
  }, [router]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/contact?limit=100');
      const data = await response.json();
      
      const messagesArray = Array.isArray(data) ? data : [];
      setMessages(messagesArray);
      
      const read = messagesArray.filter(m => m.is_read === true).length;
      const unread = messagesArray.filter(m => m.is_read === false).length;
      
      setStats({
        total: messagesArray.length,
        read,
        unread
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      });

      if (response.ok) {
        const updatedMessages = messages.map(m => 
          m.id === id ? { ...m, is_read: true } : m
        );
        setMessages(updatedMessages);
        
        const unreadCount = updatedMessages.filter(m => m.is_read === false).length;
        setStats(prev => ({
          ...prev,
          read: prev.total - unreadCount,
          unread: unreadCount
        }));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      alert('Error marking message as read');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const deletedMessage = messages.find(m => m.id === id);
        const updatedMessages = messages.filter(m => m.id !== id);
        setMessages(updatedMessages);
        
        if (deletedMessage) {
          setStats(prev => ({
            ...prev,
            total: Math.max(0, prev.total - 1),
            unread: deletedMessage.is_read ? prev.unread : Math.max(0, prev.unread - 1),
            read: deletedMessage.is_read ? Math.max(0, prev.read - 1) : prev.read
          }));
        }
        alert('Message deleted successfully!');
      } else {
        alert('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: selectedMessage.id,
          reply: replyText
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Mark as read
        await handleMarkAsRead(selectedMessage.id);
        alert('Reply sent successfully!');
        setShowReplyModal(false);
        setReplyText('');
        fetchMessages();
      } else {
        alert(data.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply');
    } finally {
      setSending(false);
    }
  };

  const viewMessage = (message) => {
    setSelectedMessage(message);
    setShowReplyModal(true);
    if (!message.is_read) {
      handleMarkAsRead(message.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = Array.isArray(messages) ? messages.filter(message => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'read' && message.is_read === true) ||
                         (filter === 'unread' && message.is_read === false);
    const matchesSearch = message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          message.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a3a1a] text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <i className="fas fa-envelope text-[#ff6b35] mr-2"></i>
              Messages
            </h1>
            <p className="text-sm text-gray-300">View and manage contact messages</p>
          </div>
          <Link href="/admin/dashboard" className="text-white hover:text-[#ff6b35] transition-colors text-sm">
            <i className="fas fa-arrow-left mr-1"></i> Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-[#2c5f2d]">{stats.total}</h3>
            <p className="text-sm text-gray-600">Total Messages</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-blue-600">{stats.unread}</h3>
            <p className="text-sm text-gray-600">Unread</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-green-600">{stats.read}</h3>
            <p className="text-sm text-gray-600">Read</p>
          </div>
        </div>

        {/* Unread Alert */}
        {stats.unread > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-envelope text-blue-500 text-xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  {stats.unread} unread message{stats.unread > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-blue-700">Click on a message to read and reply</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'all' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'unread' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-envelope mr-1"></i> Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'read' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-check-circle mr-1"></i> Read
              </button>
            </div>
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by name, email, subject, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Messages List */}
        {filteredMessages.length > 0 ? (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                  !message.is_read ? 'border-l-4 border-[#2c5f2d]' : ''
                }`}
                onClick={() => viewMessage(message)}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{message.name}</span>
                        <span className="text-xs text-gray-500">
                          &lt;{message.email}&gt;
                        </span>
                        {!message.is_read && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2c5f2d] text-white">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Subject:</span> {message.subject || 'No subject'}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        <i className="far fa-clock mr-1"></i>
                        {formatDate(message.created_at)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(message.id);
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors text-sm"
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg font-medium text-gray-700">No messages found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#2c5f2d]">
                <i className="fas fa-reply mr-2"></i> Reply to Message
              </h2>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Original Message */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{selectedMessage.name}</p>
                  <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(selectedMessage.created_at)}
                </span>
              </div>
              {selectedMessage.subject && (
                <p className="text-sm font-medium text-gray-700">Subject: {selectedMessage.subject}</p>
              )}
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleReply}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="6"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                  placeholder="Type your reply here..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {sending ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i> Sending...</>
                  ) : (
                    <><i className="fas fa-paper-plane mr-2"></i> Send Reply</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* WhatsApp Option */}
            {selectedMessage.phone && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Or reply via WhatsApp:</p>
                <a
                  href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello ' + selectedMessage.name + ', thank you for contacting THOFA. How can we help you?')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  Reply on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}