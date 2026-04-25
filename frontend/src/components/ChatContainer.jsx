// chat-app/frontend/src/components/ChatContainer.jsx
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Trash2, AlertCircle } from "lucide-react";

// Helper function to render text with clickable links
const renderTextWithLinks = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300 hover:opacity-80 transition-all font-semibold break-all">
          {part}
        </a>
      );
    }
    return part;
  });
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        {(!selectedUser.isSystemUser) && <MessageInput />}
      </div>
    );
  }

  const isTimedOut = authUser.timeoutUntil && new Date(authUser.timeoutUntil) > new Date();

  return (
    <div className="flex-1 flex flex-col overflow-auto relative">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat group transition-all transform hover:scale-[1.01] ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border border-base-300 shadow-sm">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1 flex items-center gap-2">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
              {authUser.isAdmin && (
                  <button onClick={() => deleteMessage(message._id)} className="text-error opacity-0 group-hover:opacity-100 transition-opacity" title="Admin Delete Message">
                      <Trash2 className="size-3 hover:text-red-500" />
                  </button>
              )}
            </div>
            <div className={`chat-bubble flex flex-col shadow-md ${message.isSystem ? 'bg-error text-error-content font-bold' : ''}`}>
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2 shadow-sm"
                />
              )}
              {message.text && <p className="break-words whitespace-pre-wrap">{renderTextWithLinks(message.text)}</p>}
            </div>
          </div>
        ))}
      </div>

      {isTimedOut ? (
          <div className="p-4 bg-error/10 border-t border-error/20 flex items-center justify-center gap-2 text-error">
              <AlertCircle className="size-5" />
              <span className="font-semibold text-sm">
                  You are timed out until {new Date(authUser.timeoutUntil).toLocaleString()}. You cannot send messages.
              </span>
          </div>
      ) : (
          !selectedUser.isSystemUser && <MessageInput />
      )}
    </div>
  );
};
export default ChatContainer;