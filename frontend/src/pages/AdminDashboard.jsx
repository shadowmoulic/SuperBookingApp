import React, { useState } from 'react';
import { Users, AlertTriangle, Activity, Database, Lock } from 'lucide-react';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passphrase === 'Zeque@2026#') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid gatephrase');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 transform transition-all">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Access</h2>
          <p className="text-center text-gray-500 mb-8">Enter the gatephrase to proceed.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Gatephrase"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Mock Stats
  const stats = [
    { label: 'Total Signups', value: '1,248', icon: Users, color: 'text-[#006b55]', bg: 'bg-blue-100' },
    { label: 'Active Sessions', value: '42', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { label: 'Total Attractions', value: '315', icon: Database, color: 'text-purple-500', bg: 'bg-purple-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm font-medium text-rose-500 hover:text-rose-600 px-4 py-2 bg-rose-50 rounded-lg">
            Lock Session
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-6">
              <div className={`w-16 h-16 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Signups</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 font-medium text-gray-500">User</th>
                  <th className="pb-4 font-medium text-gray-500">Email</th>
                  <th className="pb-4 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item}>
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <span className="font-medium text-gray-900">Traveler {item}</span>
                    </td>
                    <td className="py-4 text-gray-500">traveler{item}@example.com</td>
                    <td className="py-4 text-gray-500">Today</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
