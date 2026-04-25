// chat-app/frontend/src/pages/AdminPage.jsx
import { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { ShieldAlert, Ban, CheckCircle, MessageSquare } from "lucide-react";

const AdminPage = () => {
  const { users, isLoading, fetchUsers, toggleBan, sendSystemMessage } = useAdminStore();
  const [sysMsg, setSysMsg] = useState("");
  const [selectedTarget, setSelectedTarget] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSend = (e) => {
      e.preventDefault();
      if(!sysMsg.trim() || !selectedTarget) return;
      sendSystemMessage(selectedTarget, sysMsg);
      setSysMsg("");
      setSelectedTarget(null);
  }

  if (isLoading) return <div className="p-20 text-center font-bold">Loading Administration Toolkit...</div>;

  return (
    <div className="h-screen pt-20 bg-base-200">
      <div className="max-w-6xl mx-auto p-4 py-8">
         <div className="flex items-center gap-3 mb-8">
            <ShieldAlert className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
         </div>

         <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <img src={user.profilePic || "/avatar.png"} alt="Avatar" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{user.fullName}</div>
                                            {user.isAdmin && <div className="text-xs opacity-50 badge badge-ghost badge-sm mt-1">Administrator</div>}
                                        </div>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge ${user.isBanned ? 'badge-error' : 'badge-success'}`}>
                                        {user.isBanned ? 'Banned' : 'Active'}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        {!user.isAdmin && (
                                            <button onClick={()=>toggleBan(user._id)} className={`btn btn-sm ${user.isBanned ? 'btn-success text-white' : 'btn-error text-white'}`} title={user.isBanned ? "Unban User" : "Ban User"}>
                                                {user.isBanned ? <CheckCircle className="size-4"/> : <Ban className="size-4"/>}
                                            </button>
                                        )}
                                        <button onClick={()=>setSelectedTarget(user._id)} className="btn btn-sm btn-primary" title="Send System Alert">
                                            <MessageSquare className="size-4"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>

         {selectedTarget && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                 <div className="bg-base-100 p-6 rounded-xl w-full max-w-md shadow-2xl">
                     <h3 className="font-bold text-xl mb-4 text-primary">System Dispatch</h3>
                     <p className="text-sm opacity-70 mb-4">Send a high-priority system alert to this user.</p>
                     <form onSubmit={handleSend}>
                         <textarea className="textarea textarea-bordered w-full h-32 mb-4" placeholder="ATTENTION: Type your administrative alert..." value={sysMsg} onChange={e=>setSysMsg(e.target.value)}></textarea>
                         <div className="flex justify-end gap-2">
                             <button type="button" onClick={()=>setSelectedTarget(null)} className="btn btn-ghost">Cancel</button>
                             <button type="submit" className="btn btn-primary px-8">Send</button>
                         </div>
                     </form>
                 </div>
             </div>
         )}
      </div>
    </div>
  )
}
export default AdminPage;
//hi