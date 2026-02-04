import { useEffect, useState } from 'react';
import api from '../services/api';
import { User, Mail, Shield, Calendar, Save, Camera } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setProfile(res.data);
            setFormData({ name: res.data.name, email: res.data.email, password: '' });
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Failed to load profile.');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/users/profile', formData);
            setProfile(res.data);
            setIsEditing(false);
            setFormData({ ...formData, password: '' }); // Clear password
            alert('Profile updated successfully');
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    const getInitials = (name) => {
        return name
            ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
            : 'U';
    };

    if (error) return <div className="p-8 text-red-600 font-medium text-center mt-20">{error}</div>;
    if (!profile) return <div className="p-8 text-center text-gray-500 mt-20">Loading Profile...</div>;

    return (
        <div className="min-h-[80vh] flex justify-center pt-20 bg-gray-50 pb-10">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Banner */}
                <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                </div>

                <div className="px-8 pb-8">
                    {/* Avatar / Logo Section - Overlapping Banner */}
                    <div className="relative flex justify-center -mt-20 mb-6">
                        <div className="w-40 h-40 bg-white rounded-full p-2 shadow-2xl">
                            {/* Large Initials Logo */}
                            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center border-4 border-indigo-50">
                                <span className="text-5xl font-bold text-indigo-600 tracking-wider">
                                    {getInitials(profile.name)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info (Centered) */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900">{profile.name}</h1>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide ${profile.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                    profile.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                                        'bg-green-100 text-green-700'
                                }`}>
                                {profile.role}
                            </span>
                        </div>
                    </div>

                    {/* Details Card */}
                    {!isEditing ? (
                        <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                    <div className="flex items-center text-gray-700 font-medium text-lg">
                                        <Mail className="w-5 h-5 mr-3 text-indigo-400" />
                                        {profile.email}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">User ID</label>
                                    <div className="flex items-center text-gray-700 font-medium text-lg font-mono truncate" title={profile.id}>
                                        <Shield className="w-5 h-5 mr-3 text-indigo-400" />
                                        <span className="truncate w-40">{profile.id}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Member Since</label>
                                    <div className="flex items-center text-gray-700 font-medium text-lg">
                                        <Calendar className="w-5 h-5 mr-3 text-indigo-400" />
                                        {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Status</label>
                                    <div className="flex items-center text-green-600 font-bold text-lg">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                                        Active
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-center">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="bg-white rounded-xl p-6 border-2 border-indigo-50 shadow-inner space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep your current password.</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-all flex items-center"
                                >
                                    <Save size={18} className="mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
