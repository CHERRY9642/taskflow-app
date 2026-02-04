import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
// import { updateTaskStatus } from '../../features/tasks/taskSlice'; // We can use local state + api or redux.

import { Trash2, BookOpen } from 'lucide-react';

const UserDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Work Log State
    const [workLogs, setWorkLogs] = useState([]);
    const [newLog, setNewLog] = useState('');

    // Task Log Modal State
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const tasksRes = await api.get('/tasks');
            if (Array.isArray(tasksRes.data)) {
                setTasks(tasksRes.data);
            } else {
                setTasks([]);
                console.error("API returned non-array for tasks:", tasksRes.data);
            }

            const logsRes = await api.get('/work-logs');
            if (Array.isArray(logsRes.data)) {
                setWorkLogs(logsRes.data);
            } else {
                setWorkLogs([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (error) {
            alert('Failed to update status');
        }
    }

    const handleAddLog = async (e) => {
        e.preventDefault();
        if (!newLog.trim()) return;
        try {
            const res = await api.post('/work-logs', { description: newLog });
            setWorkLogs([res.data, ...workLogs]);
            setNewLog('');
        } catch (error) {
            alert('Failed to add work log');
        }
    }

    const handleDeleteLog = async (id) => {
        if (!window.confirm("Delete this entry?")) return;
        try {
            await api.delete(`/work-logs/${id}`);
            setWorkLogs(workLogs.filter(log => log.id !== id));
        } catch (error) {
            alert('Failed to delete log');
        }
    }

    if (isLoading) return <div>Loading...</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'DONE': return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    // Analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const pendingTasks = totalTasks - completedTasks;

    // Task Log Modal
    // Task Log Modal State - Moved to top

    const openLogModal = (taskId) => {
        setSelectedTaskId(taskId);
        setIsLogModalOpen(true);
    };

    const handleAddTaskLog = async (e) => {
        e.preventDefault();
        if (!newLog.trim()) return;
        try {
            const res = await api.post('/work-logs', { description: newLog, taskId: selectedTaskId });
            setWorkLogs([res.data, ...workLogs]);
            setNewLog('');
            setIsLogModalOpen(false);
            setSelectedTaskId(null);
        } catch (error) {
            alert('Failed to add note');
        }
    };

    return (
        <div className="space-y-8">
            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                        {/* Icon placeholder */}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-green-500">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-yellow-500">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
            </div>

            {/* Tasks Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Tasks</h1>
                {tasks.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow text-center border border-dashed border-gray-300">
                        <p className="text-gray-500">You have no assigned tasks.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden rounded-md border border-gray-100">
                        <ul className="divide-y divide-gray-200">
                            {tasks.map((task) => (
                                <li key={task.id} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{task.title}</p>
                                            <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                                                <button
                                                    onClick={() => openLogModal(task.id)}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none"
                                                    title="Add Note/Work Log"
                                                >
                                                    <BookOpen size={16} />
                                                </button>
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                    className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(task.status)} cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                                >
                                                    <option value="TODO">To Do</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="DONE">Done</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {task.description}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    Project: <span className="font-medium">{task.project?.name}</span>
                                                </p>
                                                {task.dueDate && (
                                                    <p className="ml-4">
                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Work Log / Notebook Section */}
            <div>
                <div className="flex items-center mb-6">
                    <BookOpen className="text-indigo-600 mr-2" size={24} />
                    <h2 className="text-2xl font-bold text-gray-800">My Notebook (Work Log)</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Area */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="font-medium text-gray-900 mb-4">Add New Entry</h3>
                            <form onSubmit={handleAddLog}>
                                <textarea
                                    value={newLog}
                                    onChange={(e) => setNewLog(e.target.value)}
                                    placeholder="What did you work on today?"
                                    className="w-full p-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 min-h-[150px] resize-none"
                                ></textarea>
                                <button
                                    type="submit"
                                    disabled={!newLog.trim()}
                                    className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Save Entry
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Log List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-medium text-gray-900">Recent Entries</h3>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                                {workLogs.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No entries yet. Start writing in your notebook!
                                    </div>
                                ) : (
                                    workLogs.map(log => (
                                        <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <button
                                                    onClick={() => handleDeleteLog(log.id)}
                                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{log.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Task Log Modal */}
            {isLogModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Add Note for Task</h2>
                        <form onSubmit={handleAddTaskLog}>
                            <textarea
                                value={newLog}
                                onChange={(e) => setNewLog(e.target.value)}
                                placeholder="Details..."
                                className="w-full p-2 border rounded min-h-[100px]"
                                required
                            />
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={() => setIsLogModalOpen(false)} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Note</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
