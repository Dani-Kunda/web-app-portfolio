import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { Database } from '../../lib/supabase';

type Project = Database['public']['Tables']['projects']['Row'];
type Finding = Database['public']['Tables']['findings']['Row'];

interface ProjectEditorProps {
  project: Project | null;
  onBack: () => void;
}

export const ProjectEditor = ({ project, onBack }: ProjectEditorProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [datePerformed, setDatePerformed] = useState('');
  const [status, setStatus] = useState<'draft' | 'in-progress' | 'completed'>('draft');
  const [isPublic, setIsPublic] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [saving, setSaving] = useState(false);
  const [showFindingForm, setShowFindingForm] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setTarget(project.target);
      setDatePerformed(project.date_performed);
      setStatus(project.status);
      setIsPublic(project.is_public);
      loadFindings();
    } else {
      setDatePerformed(new Date().toISOString().split('T')[0]);
    }
  }, [project]);

  const loadFindings = async () => {
    if (!project) return;

    const { data } = await supabase
      .from('findings')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    if (data) {
      setFindings(data);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    if (project) {
      await supabase
        .from('projects')
        .update({
          title,
          description,
          target,
          date_performed: datePerformed,
          status,
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);
    } else {
      await supabase.from('projects').insert({
        user_id: user.id,
        title,
        description,
        target,
        date_performed: datePerformed,
        status,
        is_public: isPublic,
      });
    }

    setSaving(false);
    onBack();
  };

  const handleDelete = async () => {
    if (!project || !confirm('Delete this project and all findings?')) return;

    await supabase.from('projects').delete().eq('id', project.id);
    onBack();
  };

  const handleDeleteFinding = async (findingId: string) => {
    if (!confirm('Delete this finding?')) return;

    await supabase.from('findings').delete().eq('id', findingId);
    loadFindings();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {project ? 'Edit Project' : 'New Project'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Web Application Penetration Test"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Comprehensive security assessment of..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target
                </label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date Performed
                </label>
                <input
                  type="date"
                  value={datePerformed}
                  onChange={(e) => setDatePerformed(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'in-progress' | 'completed')}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="draft">Draft</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visibility
                </label>
                <label className="flex items-center space-x-3 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-slate-600 border-slate-500 rounded focus:ring-green-500"
                  />
                  <span className="text-white">Make public</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleSave}
                disabled={!title || saving}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Project'}</span>
              </button>

              {project && (
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {project && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Findings</h3>
              <button
                onClick={() => setShowFindingForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Finding</span>
              </button>
            </div>

            {showFindingForm && (
              <FindingForm
                projectId={project.id}
                onSave={() => {
                  setShowFindingForm(false);
                  loadFindings();
                }}
                onCancel={() => setShowFindingForm(false)}
              />
            )}

            {findings.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No findings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {findings.map((finding) => (
                  <div
                    key={finding.id}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{finding.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{finding.description}</p>
                        {finding.impact && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase">Impact:</span>
                            <p className="text-gray-300 text-sm mt-1">{finding.impact}</p>
                          </div>
                        )}
                        {finding.remediation && (
                          <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase">Remediation:</span>
                            <p className="text-gray-300 text-sm mt-1">{finding.remediation}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteFinding(finding.id)}
                        className="text-red-400 hover:text-red-300 transition-colors ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface FindingFormProps {
  projectId: string;
  onSave: () => void;
  onCancel: () => void;
}

const FindingForm = ({ projectId, onSave, onCancel }: FindingFormProps) => {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium' | 'low' | 'info'>('medium');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('');
  const [remediation, setRemediation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await supabase.from('findings').insert({
      project_id: projectId,
      title,
      severity,
      description,
      impact,
      remediation,
    });

    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-700 border border-slate-600 rounded-lg p-4 mb-6">
      <h4 className="text-lg font-semibold text-white mb-4">New Finding</h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="SQL Injection in login form"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Detailed description of the vulnerability..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Impact</label>
          <textarea
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Potential impact on the system..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Remediation</label>
          <textarea
            value={remediation}
            onChange={(e) => setRemediation(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="How to fix this vulnerability..."
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!title || saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Finding'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};
