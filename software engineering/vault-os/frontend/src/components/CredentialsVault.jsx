import { useState, useEffect } from 'react';
import { credentialsAPI } from '../api';
import { Loader2, Plus, Trash2, Eye, EyeOff, Copy } from 'lucide-react';

export default function CredentialsVault({ masterPassword }) {
  const [credentials, setCredentials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState({}); // هنخزن هنا الباسوردات المفكوكة
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCredential, setNewCredential] = useState({ serviceName: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setIsLoading(true);
    try {
      const response = await credentialsAPI.list();
      setCredentials(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // فانكشن جديدة لفك التشفير عند الضغط على العين
  const handleTogglePassword = async (id) => {
    // لو الباسورد معروض فعلاً، اخفيه
    if (showPassword[id]) {
      const newShow = { ...showPassword };
      delete newShow[id];
      setShowPassword(newShow);
      return;
    }

    try {
      // بنجيب الباسورد الحقيقي من الباك إند باستخدام الماستر باسورد
      const response = await credentialsAPI.getOne(id, masterPassword);
      setShowPassword(prev => ({
        ...prev,
        [id]: response.data.password
      }));
    } catch (err) {
      setError('Failed to decrypt password. Check your master password.');
    }
  };

  const handleAddCredential = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newCredential.serviceName || !newCredential.username || !newCredential.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await credentialsAPI.add(
        newCredential.serviceName,
        newCredential.username,
        newCredential.password,
        masterPassword
      );
      setSuccess('Credential added successfully');
      setNewCredential({ serviceName: '', username: '', password: '' });
      setIsAddDialogOpen(false);
      loadCredentials();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add credential');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCredential = async (id) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) return;
    try {
      await credentialsAPI.delete(id, masterPassword);
      setSuccess('Credential deleted successfully');
      loadCredentials();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete credential');
    }
  };

  const handleGeneratePassword = async () => {
    setIsGenerating(true);
    try {
      const response = await credentialsAPI.generatePassword(16);
      setNewCredential(prev => ({ ...prev, password: response.data.password }));
    } catch (err) {
      setError('Failed to generate password');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
    setTimeout(() => setSuccess(''), 2000);
  };

  const filteredCredentials = credentials.filter(c =>
    c.service_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto" />
          <p className="text-gray-400 mt-4 uppercase text-sm tracking-wider">Loading vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 text-sm">{error}</div>}
      {success && <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 text-sm">{success}</div>}

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search credentials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-brutalist flex-1"
        />
        <button
          onClick={() => setIsAddDialogOpen(!isAddDialogOpen)}
          className="btn-brutalist flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          ADD CREDENTIAL
        </button>
      </div>

      {isAddDialogOpen && (
        <div className="card-brutalist">
          <h3 className="text-brutalist-md text-white mb-6">ADD NEW CREDENTIAL</h3>
          <form onSubmit={handleAddCredential} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-bold uppercase mb-2">Service Name</label>
              <input
                type="text"
                value={newCredential.serviceName}
                onChange={(e) => setNewCredential(prev => ({ ...prev, serviceName: e.target.value }))}
                placeholder="e.g., GitHub"
                className="input-brutalist w-full"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-bold uppercase mb-2">Username</label>
              <input
                type="text"
                value={newCredential.username}
                onChange={(e) => setNewCredential(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Your username"
                className="input-brutalist w-full"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-bold uppercase mb-2">Password</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={newCredential.password}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  className="input-brutalist flex-1"
                  required
                />
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="btn-brutalist-outline"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'GEN'}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isSubmitting} className="btn-brutalist flex-1">
                {isSubmitting ? 'Saving...' : 'SAVE CREDENTIAL'}
              </button>
              <button type="button" onClick={() => setIsAddDialogOpen(false)} className="btn-brutalist-outline flex-1">
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="red-divider" />

      {filteredCredentials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm uppercase tracking-wider">No credentials found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCredentials.map((credential) => (
            <div key={credential.id} className="card-brutalist">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-bold uppercase text-lg">{credential.service_name}</h3>
                  <p className="text-gray-400 text-sm mt-1">Username: {credential.username}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-gray-500 text-sm">Password:</span>
                    <code className="bg-zinc-800 text-red-400 px-3 py-1 text-xs font-mono">
                      {/* التعديل هنا: لو الباسورد موجود اعرضه، لو لأ اعرض النقط */}
                      {showPassword[credential.id] ? showPassword[credential.id] : '••••••••'}
                    </code>
                    <button
                      onClick={() => handleTogglePassword(credential.id)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      {showPassword[credential.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {showPassword[credential.id] && (
                      <button 
                        onClick={() => copyToClipboard(showPassword[credential.id])}
                        className="text-gray-400 hover:text-green-500 transition"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCredential(credential.id)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}