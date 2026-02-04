import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProjectList from './pages/admin/ProjectList';

import ManagerDashboard from './pages/manager/ManagerDashboard';
import CreateProject from './pages/manager/CreateProject';
import ProjectDetails from './pages/manager/ProjectDetails';

import UserDashboard from './pages/user/UserDashboard';
import Profile from './pages/Profile';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getMe } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Layout Routes */}
        <Route element={<Layout />}>
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'USER']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="projects" element={<ProjectList />} />
          </Route>

          <Route path="manager" element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
            <Route index element={<ManagerDashboard />} />
            <Route path="create-project" element={<CreateProject />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
          </Route>

          <Route path="user" element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route index element={<UserDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
