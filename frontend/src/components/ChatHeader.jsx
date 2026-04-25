// chat-app/frontend/src/components/ChatHeader.jsx
import { X, UserMinus, BadgeCheck } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, removeFriend } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium flex items-center gap-1">
                {selectedUser.fullName}
                {selectedUser.isSystemUser && <BadgeCheck className="size-4 text-blue-500" title="Verified System" />}
            </h3>
            <p className="text-sm text-base-content/70">
              {selectedUser.isSystemUser ? "System Notifications" : (onlineUsers.includes(selectedUser._id) ? "Online" : "Offline")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            {/* Remove Friend Button */}
            {!selectedUser.isSystemUser && (
                <button onClick={() => {
                    if (window.confirm("Are you sure you want to remove this friend? The entire conversation history will be permanently erased.")) {
                        removeFriend(selectedUser._id);
                    }
                }} className="btn btn-ghost btn-circle text-error" title="Remove Friend">
                    <UserMinus className="size-5" />
                </button>
            )}

            {/* Close button */}
            <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-circle">
                <X className="size-5" />
            </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;