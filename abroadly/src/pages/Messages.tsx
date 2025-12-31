// Contributors:
// Cursor AI Assistant - Messages page (extracted from Profile)

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { messagesApi, Message } from "../services/api";

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [messageTab, setMessageTab] = useState<"inbox" | "sent">("inbox");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const [inbox, sent, unread] = await Promise.all([
          messagesApi.getInbox(),
          messagesApi.getSentMessages(),
          messagesApi.getUnreadCount(),
        ]);
        setInboxMessages(Array.isArray(inbox) ? inbox : []);
        setSentMessages(Array.isArray(sent) ? sent : []);
        setUnreadCount(unread?.unread_count || 0);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadMessages();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your messages.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'Your conversations with other students'}
          </p>
        </div>

        {/* Inbox/Sent Toggle */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setMessageTab("inbox")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                  messageTab === "inbox"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Inbox {inboxMessages.length > 0 && `(${inboxMessages.length})`}
                {unreadCount > 0 && messageTab !== "inbox" && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMessageTab("sent")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                  messageTab === "sent"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Sent {sentMessages.length > 0 && `(${sentMessages.length})`}
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading messages...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Message List */}
                {(messageTab === "inbox" ? inboxMessages : sentMessages).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {messageTab === "inbox" ? "No Messages Yet" : "No Sent Messages"}
                    </h4>
                    <p className="text-gray-600">
                      {messageTab === "inbox"
                        ? "When someone sends you a message, it will appear here."
                        : "Messages you send will appear here."}
                    </p>
                  </div>
                ) : (
                  (messageTab === "inbox" ? inboxMessages : sentMessages).map((message) => (
                    <div
                      key={message.id}
                      className={`border rounded-lg p-4 cursor-pointer transition hover:shadow-md ${
                        !message.read && messageTab === "inbox"
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.read && messageTab === "inbox") {
                          messagesApi.markAsRead(message.id);
                          setInboxMessages(
                            inboxMessages.map((m) =>
                              m.id === message.id ? { ...m, read: true } : m
                            )
                          );
                          setUnreadCount(Math.max(0, unreadCount - 1));
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {!message.read && messageTab === "inbox" && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                          <span className="font-semibold text-gray-900">
                            {messageTab === "inbox"
                              ? message.sender_name || message.sender_email
                              : message.recipient_name || message.recipient_email}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">{message.subject}</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{message.content}</p>
                      {(message.related_program_name || message.related_place_name || message.related_trip_name) && (
                        <div className="mt-2 text-xs text-gray-500">
                          Re: {message.related_program_name || message.related_place_name || message.related_trip_name}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {messageTab === "inbox" ? "From: " : "To: "}
                      {messageTab === "inbox"
                        ? selectedMessage.sender_name || selectedMessage.sender_email
                        : selectedMessage.recipient_name || selectedMessage.recipient_email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMessage(null);
                      setReplyContent("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {(selectedMessage.related_program_name || selectedMessage.related_place_name || selectedMessage.related_trip_name) && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <span className="text-sm text-gray-600">
                      Regarding: <span className="font-medium">{selectedMessage.related_program_name || selectedMessage.related_place_name || selectedMessage.related_trip_name}</span>
                    </span>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>

                {/* Reply Form (only for inbox) */}
                {messageTab === "inbox" && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Reply</h4>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={async () => {
                          await messagesApi.deleteMessage(selectedMessage.id);
                          setInboxMessages(inboxMessages.filter((m) => m.id !== selectedMessage.id));
                          setSelectedMessage(null);
                        }}
                        className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                      <button
                        onClick={async () => {
                          if (!replyContent.trim()) return;
                          setSendingReply(true);
                          try {
                            await messagesApi.sendMessage({
                              recipient_id: selectedMessage.sender_id,
                              subject: `Re: ${selectedMessage.subject}`,
                              content: replyContent,
                              related_program_id: selectedMessage.related_program_id,
                              related_place_id: selectedMessage.related_place_id,
                              related_trip_id: selectedMessage.related_trip_id,
                              parent_message_id: selectedMessage.id,
                            });
                            setReplyContent("");
                            setSelectedMessage(null);
                            // Refresh sent messages
                            const sent = await messagesApi.getSentMessages();
                            setSentMessages(sent);
                            alert("Reply sent!");
                          } catch (err: any) {
                            alert(err.response?.data?.detail || "Failed to send reply");
                          } finally {
                            setSendingReply(false);
                          }
                        }}
                        disabled={!replyContent.trim() || sendingReply}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                      >
                        {sendingReply ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

