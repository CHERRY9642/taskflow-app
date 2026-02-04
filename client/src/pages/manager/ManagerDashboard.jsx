import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AnalyticsCard from '../../components/AnalyticsCard';
import { Folder, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ManagerDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Analytics
            const analyticsRes = await api.get('/analytics/manager');
            setStats(analyticsRes.data);

            // Projects List
            const projectsRes = await api.get('/projects');
            setProjects(projectsRes.data);
        } catch (error) {
            console.error("Error fetching manager data", error);
            setError(error.response?.data?.message || error.message || "Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading Manager Dashboard...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!stats) return <div className="p-8">No stats available.</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>

            {/* Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                    title="My Projects"
                    value={stats.projects.total}
                    icon={Folder}
                    color="bg-blue-100 text-blue-600"
                />
                <AnalyticsCard
                    title="Tasks Done"
                    value={stats.tasks.done}
                    icon={CheckCircle}
                    color="bg-green-100 text-green-600"
                />
                <AnalyticsCard
                    title="In Progress"
                    value={stats.tasks.inProgress}
                    icon={Clock}
                    color="bg-yellow-100 text-yellow-600"
                />
                <AnalyticsCard
                    title="Todo Tasks"
                    value={stats.tasks.todo}
                    icon={AlertCircle}
                    color="bg-red-100 text-red-600"
                />
            </div>

            {/* Projects List */}
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">My Projects</h2>
                    <p className="text-gray-500 text-sm">Manage your active projects</p>
                </div>
                <Link to="/manager/create-project" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                    + New Project
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-100">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-gray-800 truncate">{project.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {project.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-gray-600 mt-2 line-clamp-2">{project.description}</p>

                        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                            <span>Tasks: {project.tasks?.length || 0}</span>
                            <Link to={`/manager/projects/${project.id}`} className="text-indigo-600 font-medium hover:text-indigo-800">
                                Manage &rarr;
                            </Link>
                        </div>
                    </div>
                ))}
                {projects.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                        <p className="text-gray-500">No projects found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
