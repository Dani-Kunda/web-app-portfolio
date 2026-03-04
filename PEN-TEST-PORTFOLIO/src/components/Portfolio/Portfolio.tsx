import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, ArrowLeft, AlertTriangle, Calendar, Target } from 'lucide-react';
import { Database } from '../../lib/supabase';

type Project = Database['public']['Tables']['projects']['Row'];
type Finding = Database['public']['Tables']['findings']['Row'];

interface PortfolioProps {
  onBack?: () => void;
}

export const Portfolio = ({ onBack }: PortfolioProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicProjects();
  }, []);

  const loadPublicProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'completed')
      .order('date_performed', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const loadProjectFindings = async (projectId: string) => {
    const { data } = await supabase
      .from('findings')
      .select('*')
      .eq('project_id', projectId)
      .order('severity', { ascending: true });

    if (data) {
      setFindings(data);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    loadProjectFindings(project.id);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Portfolio</span>
          </button>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{selectedProject.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedProject.date_performed).toLocaleDateString()}</span>
                  </div>
                  {selectedProject.target && (
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>{selectedProject.target}</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/50">
                Completed
              </span>
            </div>

            {selectedProject.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">{selectedProject.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-white mb-4">Findings ({findings.length})</h3>
              {findings.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No findings documented</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-white flex-1">{finding.title}</h4>
                        <span className={`px-3 py-1 rounded text-xs font-medium border ${getSeverityColor(finding.severity)} ml-4`}>
                          {finding.severity.toUpperCase()}
                        </span>
                      </div>

                      {finding.description && (
                        <div className="mb-4">
                          <p className="text-gray-300 text-sm leading-relaxed">{finding.description}</p>
                        </div>
                      )}

                      {finding.impact && (
                        <div className="mb-4 bg-slate-800/50 rounded p-3">
                          <span className="text-xs font-semibold text-orange-400 uppercase block mb-1">
                            Impact
                          </span>
                          <p className="text-gray-300 text-sm">{finding.impact}</p>
                        </div>
                      )}

                      {finding.remediation && (
                        <div className="bg-green-500/10 rounded p-3">
                          <span className="text-xs font-semibold text-green-400 uppercase block mb-1">
                            Remediation
                          </span>
                          <p className="text-gray-300 text-sm">{finding.remediation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-500 mr-3" />
              <span className="text-xl font-bold text-white">PentTest Portfolio</span>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Security Assessment Portfolio</h1>
          <p className="text-gray-400 text-lg">
            Professional penetration testing projects and security findings
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading portfolio...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No public projects yet</h3>
            <p className="text-gray-500">Check back later for published security assessments</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-green-500/50 transition-all cursor-pointer group"
              >
                <h3 className="text-xl font-semibold text-white group-hover:text-green-400 transition-colors mb-3">
                  {project.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {project.description || 'No description available'}
                </p>

                {project.target && (
                  <div className="mb-4 flex items-center space-x-2 text-gray-400">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">{project.target}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex items-center space-x-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.date_performed).toLocaleDateString()}</span>
                  </div>
                  <span className="text-green-400 text-sm font-medium group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
