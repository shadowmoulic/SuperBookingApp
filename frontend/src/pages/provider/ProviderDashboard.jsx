import { useState, useEffect } from "react";
import api from "../../api/api";
import Dashboard from "../../components/provider/Dashboard";
import { Loader2, AlertCircle } from "lucide-react";

export default function ProviderDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const res = await api.get("/provider-api/home/");
        setData(res.data);
      } catch (err) {
        console.error("Error loading provider dashboard:", err);
        setError(err.response?.data?.detail || "Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="font-bold text-lg">Error</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return <Dashboard data={data} />;
}
