// chat-app/frontend/src/components/Sidebar.jsx
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Mail, Check, X, UserPlus } from "lucide-react";

const Sidebar = () => {
  const { 
      getUsers, users, selectedUser, setSelectedUser, isUsersLoading, 
      getFriendRequests, friendRequests, sendFriendRequest, acceptRequest, declineRequest 
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [tab, setTab] = useState("friends");
  const [emailInput, setEmailInput] = useState("");

  useEffect(() => {
    getUsers();
    getFriendRequests();
  }, [getUsers, getFriendRequests]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
        sendFriendRequest(emailInput.trim());
        setEmailInput("");
    }
  }

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <div className="hidden lg:flex gap-2 mb-4">
           <button onClick={()=>setTab('friends')} className={`btn btn-xs flex-1 ${tab==='friends'?'btn-primary':''}`}>Friends</button>
           <button onClick={()=>setTab('requests')} className={`btn btn-xs flex-1 ${tab==='requests'?'btn-primary':''}`}>
               Reqs {friendRequests.length > 0 && `(${friendRequests.length})`}
           </button>
        </div>

        {tab === 'friends' && (
          <form onSubmit={handleAddFriend} className="hidden lg:flex gap-2 mb-2">
            <input type="email" placeholder="Add by email..." className="input input-xs input-bordered flex-1" value={emailInput} onChange={(e)=>setEmailInput(e.target.value)} />
            <button type="submit" className="btn btn-xs btn-primary" title="Add Contact"><UserPlus className="size-3"/></button>
          </form>
        )}

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input type="checkbox" checked={showOnlineOnly} onChange={(e) => setShowOnlineOnly(e.target.checked)} className="checkbox checkbox-sm" />
            <span className="text-sm">Show online only</span>
          </label>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
         {tab === 'friends' ? (
            <>
            {filteredUsers.map((user) => (
              <button key={user._id} onClick={() => setSelectedUser(user)} className={`w-full p-3 flex items-center justify-center lg:justify-start gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}>
                <div className="relative mx-auto lg:mx-0">
                  <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="size-12 object-cover rounded-full" />
                  {onlineUsers.includes(user._id) && <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />}
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">{onlineUsers.includes(user._id) ? "Online" : "Offline"}</div>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && <div className="text-center text-zinc-500 py-4 hidden lg:block">No contacts</div>}
            </>
         ) : (
            <>
            {friendRequests.map((req) => (
              <div key={req._id} className="w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors">
                <img src={req.profilePic || "/avatar.png"} alt={req.fullName} className="size-12 object-cover rounded-full mx-auto lg:mx-0" />
                <div className="hidden lg:block text-left min-w-0 flex-1">
                  <div className="font-medium truncate text-sm">{req.fullName}</div>
                  <div className="flex gap-2 mt-1">
                     <button onClick={()=>acceptRequest(req._id)} className="btn btn-xs btn-success text-white"><Check className="size-3"/></button>
                     <button onClick={()=>declineRequest(req._id)} className="btn btn-xs btn-error text-white"><X className="size-3"/></button>
                  </div>
                </div>
              </div>
            ))}
            {friendRequests.length === 0 && <div className="text-center text-zinc-500 py-4 hidden lg:block">No requests</div>}
            </>
         )}
      </div>
    </aside>
  );
};
export default Sidebar;



