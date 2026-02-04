import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, UserCog, Plus } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            setMessage('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter((user) => user.id !== id));
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            const response = await api.put(`/users/${id}/role`, { role: newRole });
            setUsers(users.map((user) => (user.id === id ? response.data : user)));
        } catch (error) {
            alert('Failed to update role');
        }
    };

    // Create User State & Logic
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            alert('User created successfully');
            setIsUserModalOpen(false);
            setNewUser({ name: '', email: '', password: '', role: 'USER' });
            fetchUsers();
        } catch (error) {
            alert('Failed to create user');
        }
    };

    if (isLoading) return <div>Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <button
                    onClick={() => setIsUserModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Create New User
                </button>
            </div>

            {message && <div className="text-red-500">{message}</div>}

            {/* ... Table ... */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                        user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        >
                                            <option value="USER">User</option>
                                            <option value="MANAGER">Manager</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>

                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <input
                                type="text" placeholder="Full Name" required
                                value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="email" placeholder="Email Address" required
                                value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="password" placeholder="Password" required minLength="6"
                                value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                            <select
                                value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="USER">User</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
