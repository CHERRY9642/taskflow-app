import { useEffect, useState } from 'react';
import api from '../../services/api';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) return <div>Loading projects...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">All Projects</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{project.name}</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">{project.description}</p>
                            <div className="mt-4">
                                <span className="text-sm font-medium text-gray-500">Manager: </span>
                                <span className="text-sm text-gray-900">{project.manager?.name || 'Unassigned'}</span>
                            </div>
                            <div className="mt-2">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProjectList;
