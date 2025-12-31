
import React, { useState } from 'react';
import { messagesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AskAboutButtonProps {
  recipientId: number;
  recipientName?: string;
  context: {
    type: 'program' | 'place' | 'trip';
    id: number;
    name: string;
  };
}

const AskAboutButton: React.FC<AskAboutButtonProps> = ({
  recipientId,
  recipientName,
  context,
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState(`Question about ${context.name}`);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;

    setSending(true);
    try {
      await messagesApi.sendMessage({
        recipient_id: recipientId,
        subject,
        content,
        related_program_id: context.type === 'program' ? context.id : undefined,
        related_place_id: context.type === 'place' ? context.id : undefined,
        related_trip_id: context.type === 'trip' ? context.id : undefined,
      });
      setShowModal(false);
      setContent('');
      alert('Message sent!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Don't show if not logged in or trying to message yourself
  if (!user) {
    return null;
  }

  // Check if user is trying to message themselves
  const currentUserId = (user as any).id;
  if (currentUserId === recipientId) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Ask about this
      </button>

      {/* Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Send Message</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  To: <span className="font-medium">{recipientName || 'User'}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Re: {context.name}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Hi! I saw your review and wanted to ask..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!content.trim() || sending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AskAboutButton;


