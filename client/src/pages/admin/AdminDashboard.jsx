import { useEffect, useState } from "react";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
} from "../../api/admin";
import AdminNavbar from "../../components/AdminNavbar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Pending Users");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPendingUsers = async () => {
    setLoading(true);
    const res = await getPendingUsers();
    setPendingUsers(res.data);
    setLoading(false);
  };

  const loadAllUsers = async () => {
    setLoading(true);
    const res = await getAllUsers();
    setAllUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "Pending Users") loadPendingUsers();
    if (activeTab === "Active Users") loadAllUsers();
  }, [activeTab]);

  const handleApprove = async (id) => {
    await approveUser(id);
    loadPendingUsers();
  };

  const handleReject = async (id) => {
    await rejectUser(id);
    loadPendingUsers();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto mt-8 bg-white p-6 rounded-lg shadow">
        {/* PENDING USERS */}
        {activeTab === "Pending Users" && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">
              Pending Approvals
            </h2>

            {loading ? (
              <p>Loading...</p>
            ) : pendingUsers.length === 0 ? (
              <p className="text-gray-500">No pending users</p>
            ) : (
              <table className="w-full border">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="p-3 border">Email</th>
                    <th className="p-3 border">Role</th>
                    <th className="p-3 border">Department</th>
                    <th className="p-3 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u) => (
                    <tr key={u._id} className="text-center">
                      <td className="p-3 border">{u.email}</td>
                      <td className="p-3 border">
                        {u.role === "COURSE_INSTRUCTOR"
                          ? "Instructor"
                          : u.role === "FA"
                          ? "Faculty Advisor"
                          : u.role}
                      </td>
                      <td className="p-3 border">{u.department}</td>
                      <td className="p-3 border flex gap-2 justify-center">
                        <button
                          onClick={() => handleApprove(u._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(u._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* ALL USERS */}
        {activeTab === "Active Users" && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">
              All Users
            </h2>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border">Name</th>
                    <th className="p-3 border">Email</th>
                    <th className="p-3 border">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u._id} className="text-center">
                      <td className="p-3 border">{u.firstName} {u.lastName}</td>
                      <td className="p-3 border">{u.email}</td>
                      <td className="p-3 border">
                        {u.role === "COURSE_INSTRUCTOR"
                          ? "Instructor"
                          : u.role === "FA"
                          ? "Faculty Advisor"
                          : u.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* HELP */}
        {activeTab === "Help" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Admin Help</h2>
            <p className="text-gray-700">
              Admin actions are logged internally.
              <br />
              For issues contact:
              <span className="font-bold text-indigo-700">
                {" "}
                developer@gmail.com
              </span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
