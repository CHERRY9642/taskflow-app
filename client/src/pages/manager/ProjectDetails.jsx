import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);

    // Modals
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    // Forms
    const [taskForm, setTaskForm] = useState({
        id: null, // If set, we are editing
        title: '',
        description: '',
        assigneeId: '',
        dueDate: '',
        status: 'TODO'
    });

    const [projectForm, setProjectForm] = useState({
        name: '',
        description: '',
        status: ''
    });

    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchProjectData();
        }
    }, [id, user?.id]); // Re-fetch if user loads (to get permissions/users list)

    const fetchProjectData = async () => {
        try {
            const projectRes = await api.get(`/projects/${id}`);
            setProject(projectRes.data);

            // Only update form if not already editing (optional, but effectively we just reset on load)
            setProjectForm({
                name: projectRes.data.name,
                description: projectRes.data.description,
                status: projectRes.data.status
            });

            const tasksRes = await api.get(`/tasks?projectId=${id}`);
            setTasks(tasksRes.data);

            // Fetch users for assignment (Only if manager/admin)
            // Ensure user is loaded before checking role
            if (user && user.role !== 'USER') {
                try {
                    const usersRes = await api.get('/users');
                    setUsers(usersRes.data);
                } catch (err) {
                    console.error("Failed to fetch users list", err);
                }
            }
        } catch (error) {
            console.error(error);
            setError("Failed to load project details. It may not exist or you don't have permission.");
        }
    };

    // --- Project Actions ---

    const handleDeleteProject = async () => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                await api.delete(`/projects/${id}`);
                navigate('/manager');
            } catch (error) {
                alert('Failed to delete project');
            }
        }
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/projects/${id}`, projectForm);
            setProject(res.data);
            setIsProjectModalOpen(false);
        } catch (error) {
            alert('Failed to update project');
        }
    };

    // --- Task Actions ---

    const openTaskModal = (task = null) => {
        if (task) {
            setTaskForm({
                id: task.id,
                title: task.title,
                description: task.description || '',
                assigneeId: task.assigneeId || '',
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                status: task.status
            });
        } else {
            setTaskForm({ id: null, title: '', description: '', assigneeId: '', dueDate: '', status: 'TODO' });
        }
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        try {
            if (taskForm.id) {
                // Edit
                await api.put(`/tasks/${taskForm.id}`, taskForm);
            } else {
                // Create
                await api.post('/tasks', { ...taskForm, projectId: id });
            }
            setIsTaskModalOpen(false);
            fetchProjectData(); // Refresh list
        } catch (error) {
            alert('Failed to save task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Delete this task?')) {
            try {
                await api.delete(`/tasks/${taskId}`);
                setTasks(tasks.filter(t => t.id !== taskId));
            } catch (error) {
                alert('Failed to delete task');
            }
        }
    };

    if (error) return <div className="p-8 text-red-600 font-medium">{error}</div>;
    if (!project) return <div>Loading...</div>;

    const canEditProject = user?.role === 'ADMIN' || user?.role === 'MANAGER';
    const canManageTasks = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    return (
        <div className="space-y-6">
            {/* Project Header */}
            <div className="bg-white p-6 rounded shadow relative">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            {project.name}
                            <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {project.status.toUpperCase()}
                            </span>
                        </h1>
                        <p className="mt-2 text-gray-600">{project.description}</p>
                    </div>
                    {canEditProject && (
                        <div className="flex gap-2">
                            <button onClick={() => setIsProjectModalOpen(true)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded">
                                <Edit2 size={20} />
                            </button>
                            <button onClick={handleDeleteProject} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Task Section */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
                {canManageTasks && (
                    <button
                        onClick={() => openTaskModal()}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Task
                    </button>
                )}
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {tasks.length === 0 ? <li className="p-6 text-center text-gray-500">No tasks created yet.</li> : tasks.map(task => (
                        <li key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">Assignee:</span>
                                            {task.assignee ? (
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                                                    {task.assignee.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Unassigned</span>
                                            )}
                                        </div>
                                        {task.dueDate && (
                                            <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full w-24 text-center ${task.status === 'DONE' ? 'bg-green-100 text-green-800' :
                                        task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {task.status.replace('_', ' ')}
                                    </span>

                                    {canManageTasks && (
                                        <div className="flex gap-2">
                                            <button onClick={() => openTaskModal(task)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Task Modal (Create/Edit) */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{taskForm.id ? 'Edit Task' : 'New Task'}</h2>
                            <button onClick={() => setIsTaskModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleSaveTask} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                                    required className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    rows="3"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Assign To</label>
                                    <select
                                        value={taskForm.assigneeId} onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            {taskForm.id && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DONE">Done</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project Modal (Edit) */}
            {isProjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Edit Project</h2>
                            <button onClick={() => setIsProjectModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleUpdateProject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                                    required className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;
