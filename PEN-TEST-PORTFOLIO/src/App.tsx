import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProjectEditor } from './components/Project/ProjectEditor';
import { Portfolio } from './components/Portfolio/Portfolio';
import { Database } from './lib/supabase';

type Project = Database['public']['Tables']['projects']['Row'];

type View = 'login' | 'signup' | 'dashboard' | 'editor' | 'portfolio';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('login');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (user && (view === 'login' || view === 'signup')) {
      setView('dashboard');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (view === 'signup') {
      return <Signup onToggleMode={() => setView('login')} />;
    }
    return <Login onToggleMode={() => setView('signup')} />;
  }

  if (view === 'editor') {
    return (
      <ProjectEditor
        project={selectedProject}
        onBack={() => {
          setSelectedProject(null);
          setView('dashboard');
        }}
      />
    );
  }

  if (view === 'portfolio') {
    return <Portfolio onBack={() => setView('dashboard')} />;
  }

  return (
    <Dashboard
      onCreateProject={() => {
        setSelectedProject(null);
        setView('editor');
      }}
      onEditProject={(project) => {
        setSelectedProject(project);
        setView('editor');
      }}
      onViewPortfolio={() => setView('portfolio')}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
