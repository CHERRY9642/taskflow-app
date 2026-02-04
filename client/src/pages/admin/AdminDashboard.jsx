import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import AnalyticsCard from '../../components/AnalyticsCard';
import { Users, Folder, CheckSquare, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentProjects, setRecentProjects] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/analytics/admin');
            setStats(res.data);
            setRecentUsers(res.data.recentActivity.users);
            setRecentProjects(res.data.recentActivity.projects);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        }
    };

    if (!stats) return <div className="p-8 text-center">Loading Analytics...</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">System Overview & Controls</p>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                    title="Total Users"
                    value={stats.users.total}
                    icon={Users}
                    color="bg-blue-100 text-blue-600"
                />
                <AnalyticsCard
                    title="Active Projects"
                    value={stats.projects.active}
                    icon={Folder}
                    color="bg-green-100 text-green-600"
                />
                <AnalyticsCard
                    title="Tasks Completed"
                    value={stats.tasks.done}
                    icon={CheckSquare}
                    color="bg-purple-100 text-purple-600"
                />
                <AnalyticsCard
                    title="System Activity"
                    value="High"
                    icon={Activity}
                    color="bg-orange-100 text-orange-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">New Users</h2>
                        <Link to="/admin/users" className="text-sm text-indigo-600 hover:text-indigo-800">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                                user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Projects */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Latest Projects</h2>
                        <Link to="/admin/projects" className="text-sm text-indigo-600 hover:text-indigo-800">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {recentProjects.map(project => (
                            <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div>
                                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                                    <p className="text-xs text-gray-500">Manager: {project.manager?.name}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded ${project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default AdminDashboard;
