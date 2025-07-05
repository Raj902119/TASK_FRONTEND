'use client';

import { useState, useEffect } from 'react';
import { QueueStats as QueueStatsType } from '@/types';
import { queueApi } from '@/lib/api';
import { PlayCircle, PauseCircle, RotateCcw, Trash2 } from 'lucide-react';

export default function QueueStats() {
  const [stats, setStats] = useState<QueueStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await queueApi.getStats();
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch queue stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handlePause = async () => {
    try {
      await queueApi.pause();
      alert('Queue paused successfully');
    } catch (err) {
      alert('Failed to pause queue');
    }
  };

  const handleResume = async () => {
    try {
      await queueApi.resume();
      alert('Queue resumed successfully');
    } catch (err) {
      alert('Failed to resume queue');
    }
  };

  const handleRetry = async () => {
    try {
      const response = await queueApi.retry();
      alert(response.data.message);
      fetchStats();
    } catch (err) {
      alert('Failed to retry failed jobs');
    }
  };

  const handleClean = async () => {
    if (confirm('Are you sure you want to clean old jobs from the queue?')) {
      try {
        const response = await queueApi.clean(24); // 24 hours
        alert(`Cleaned ${response.data.data.completedRemoved} completed and ${response.data.data.failedRemoved} failed jobs`);
        fetchStats();
      } catch (err) {
        alert('Failed to clean queue');
      }
    }
  };

  if (loading && !stats) return <div>Loading queue stats...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!stats) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Queue Status</h2>
        <div className="flex space-x-2">
          <button
            onClick={handlePause}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PauseCircle className="mr-2 h-4 w-4" />
            Pause
          </button>
          <button
            onClick={handleResume}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Resume
          </button>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Failed
          </button>
          <button
            onClick={handleClean}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clean
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500">Waiting</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.waiting}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-600">Active</p>
          <p className="mt-1 text-2xl font-semibold text-blue-900">{stats.active}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm font-medium text-green-600">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-green-900">{stats.completed}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm font-medium text-red-600">Failed</p>
          <p className="mt-1 text-2xl font-semibold text-red-900">{stats.failed}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-600">Delayed</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-900">{stats.delayed}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm font-medium text-indigo-600">Total</p>
          <p className="mt-1 text-2xl font-semibold text-indigo-900">{stats.total}</p>
        </div>
      </div>
    </div>
  );
} 