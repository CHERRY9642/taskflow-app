import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    LogOut,
    Menu,
    X,
    UserCircle
} from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const isActive = (path) => location.pathname === path;

    // Define menu items based on role
    const getMenuItems = () => {
        if (!user) return [];

        const items = [];

        // Admin Menu
        if (user.role === 'ADMIN') {
            items.push({ name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> });
            items.push({ name: 'Users', path: '/admin/users', icon: <Users size={20} /> });
            items.push({ name: 'Projects', path: '/admin/projects', icon: <FolderKanban size={20} /> });
        }
        // Manager Menu
        else if (user.role === 'MANAGER') {
            items.push({ name: 'Dashboard', path: '/manager', icon: <LayoutDashboard size={20} /> });
            // items.push({ name: 'My Projects', path: '/manager/projects', icon: <FolderKanban size={20} /> });
        }
        // User Menu
        else if (user.role === 'USER') {
            items.push({ name: 'My Tasks', path: '/user', icon: <LayoutDashboard size={20} /> });
        }

        // Common for all
        items.push({ name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> });

        return items;
    }

    const menuItems = getMenuItems();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-indigo-800 text-white">
                <div className="flex items-center justify-center h-16 bg-indigo-900 font-bold text-xl">
                    TaskFlow
                </div>
                <div className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3 rounded transition-colors ${isActive(item.path) ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                                }`}
                        >
                            {item.icon}
                            <span className="ml-3">{item.name}</span>
                        </Link>
                    ))}
                </div>
                <div className="p-4 border-t border-indigo-700">
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-2 text-red-200 hover:text-white hover:bg-red-600 rounded transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="ml-3">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={toggleSidebar}></div>
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-indigo-800 text-white transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-4 bg-indigo-900 font-bold text-xl">
                    <span>TaskFlow</span>
                    <button onClick={toggleSidebar}><X size={24} /></button>
                </div>
                <div className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center px-4 py-3 rounded transition-colors ${isActive(item.path) ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                                }`}
                        >
                            {item.icon}
                            <span className="ml-3">{item.name}</span>
                        </Link>
                    ))}
                </div>
                <div className="p-4 border-t border-indigo-700">
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-2 text-red-200 hover:text-white hover:bg-red-600 rounded transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="ml-3">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between h-16 px-6 bg-white shadow md:justify-end">
                    <button onClick={toggleSidebar} className="md:hidden text-gray-700">
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center">
                        <div className="text-gray-700 text-right">
                            <span className="font-semibold block">{user?.name}</span>
                            <span className="text-xs text-gray-500 block">{user?.email} ({user?.role})</span>
                        </div>
                        {/* Avatar or other header items */}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
