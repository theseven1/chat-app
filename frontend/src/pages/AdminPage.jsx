// chat-app/frontend/src/pages/AdminPage.jsx
import { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { ShieldAlert, Ban, CheckCircle, MessageSquare, Clock } from "lucide-react";

const AdminPage = () => {
  const { users, isLoading, fetchUsers, toggleBan, timeoutUser, removeTimeout, sendSystemMessage } = useAdminStore();
  const [sysMsg, setSysMsg] = useState("");
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [timeoutTarget, setTimeoutTarget] = useState(null);
  const [timeoutDuration, setTimeoutDuration] = useState(60);

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

  const handleTimeout = (e) => {
      e.preventDefault();
      if(!timeoutTarget) return;
      timeoutUser(timeoutTarget, parseInt(timeoutDuration));
      setTimeoutTarget(null);
  }

  if (isLoading) return <div className="p-20 text-center font-bold animate-pulse">Loading Administration Toolkit...</div>;

  return (
    <div className="h-screen pt-20 bg-base-200">
      <div className="max-w-6xl mx-auto p-4 py-8">
         <div className="flex items-center gap-3 mb-8">
            <ShieldAlert className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
         </div>

         <div className="bg-base-100 rounded-xl shadow-lg border border-base-300 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead className="bg-base-200/50">
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const isTimedOut = user.timeoutUntil && new Date(user.timeoutUntil) > new Date();

                            return (
                            <tr key={user._id} className="hover:bg-base-200/20 transition-colors">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12 shadow-sm border border-base-300">
                                                <img src={user.profilePic || "/avatar.png"} alt="Avatar" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{user.fullName}</div>
                                            {user.isAdmin && <div className="badge badge-primary badge-sm mt-1 shadow-sm">Administrator</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="font-mono text-sm opacity-80">{user.email}</td>
                                <td>
                                    <div className="flex flex-col gap-1 items-start">
                                        <span className={`badge ${user.isBanned ? 'badge-error' : 'badge-success'} shadow-sm`}>
                                            {user.isBanned ? 'Banned' : 'Active'}
                                        </span>
                                        {isTimedOut && (
                                            <span className="badge badge-warning badge-sm shadow-sm opacity-90">
                                               <Clock className="size-3 mr-1" />
                                               {new Date(user.timeoutUntil).toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        {!user.isAdmin && (
                                            <>
                                            <button onClick={()=>toggleBan(user._id)} className={`btn btn-sm shadow-sm transition-transform hover:scale-105 ${user.isBanned ? 'btn-success text-white' : 'btn-error text-white'}`} title={user.isBanned ? "Unban User" : "Ban User"}>
                                                {user.isBanned ? <CheckCircle className="size-4"/> : <Ban className="size-4"/>}
                                            </button>
                                            
                                            {isTimedOut ? (
                                                <button onClick={()=>removeTimeout(user._id)} className="btn btn-sm btn-success text-white shadow-sm transition-transform hover:scale-105" title="Remove Timeout">
                                                   <CheckCircle className="size-4"/>
                                                </button>
                                            ) : (
                                                <button onClick={()=>setTimeoutTarget(user._id)} className="btn btn-sm btn-warning shadow-sm transition-transform hover:scale-105" title="Timeout User">
                                                    <Clock className="size-4"/>
                                                </button>
                                            )}
                                            </>
                                        )}
                                        <button onClick={()=>setSelectedTarget(user._id)} className="btn btn-sm btn-primary shadow-sm transition-transform hover:scale-105" title="Send System Alert">
                                            <MessageSquare className="size-4"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
         </div>

         {/* System Message Modal */}
         {selectedTarget && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 transition-all">
                 <div className="bg-base-100 p-6 rounded-xl w-full max-w-md shadow-2xl scale-100 transform transition-transform animate-in fade-in zoom-in duration-200">
                     <h3 className="font-bold text-xl mb-4 text-primary flex items-center gap-2"><ShieldAlert className="size-6"/> System Dispatch</h3>
                     <p className="text-sm opacity-70 mb-4">Send a system alert to this user.</p>
                     <form onSubmit={handleSend}>
                         <textarea className="textarea textarea-bordered w-full h-32 mb-4 focus:ring-2 focus:ring-primary/50" placeholder="ATTENTION: Type your administrative alert..." value={sysMsg} onChange={e=>setSysMsg(e.target.value)}></textarea>
                         <div className="flex justify-end gap-2">
                             <button type="button" onClick={()=>setSelectedTarget(null)} className="btn btn-ghost">Cancel</button>
                             <button type="submit" className="btn btn-primary px-8 shadow-md">Send</button>
                         </div>
                     </form>
                 </div>
             </div>
         )}

         {/* Timeout Modal */}
         {timeoutTarget && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 transition-all">
                 <div className="bg-base-100 p-6 rounded-xl w-full max-w-sm shadow-2xl scale-100 transform transition-transform animate-in fade-in zoom-in duration-200">
                     <h3 className="font-bold text-xl mb-4 text-warning flex items-center gap-2"><Clock className="size-6"/> Apply Timeout</h3>
                     <p className="text-sm opacity-70 mb-4">Temporarily disable messages and interactions.</p>
                     <form onSubmit={handleTimeout}>
                         <select className="select select-bordered w-full mb-4" value={timeoutDuration} onChange={(e) => setTimeoutDuration(e.target.value)}>
                             <option value={10}>10 Minutes</option>
                             <option value={60}>1 Hour</option>
                             <option value={60*24}>1 Day</option>
                             <option value={60*24*7}>1 Week</option>
                             <option value={60*24*30}>1 Month</option>
                         </select>
                         <div className="flex justify-end gap-2">
                             <button type="button" onClick={()=>setTimeoutTarget(null)} className="btn btn-ghost">Cancel</button>
                             <button type="submit" className="btn btn-warning px-8 shadow-md">Apply</button>
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