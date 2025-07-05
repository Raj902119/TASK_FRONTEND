'use client';

import { useState, useEffect, useCallback } from 'react';
import { ImportLog, ImportStats, PaginationData } from '@/types';
import { importApi } from '@/lib/api';
import ImportHistoryTable from '@/components/ImportHistoryTable';
import StatsCard from '@/components/StatsCard';
import QueueStats from '@/components/QueueStats';
import { FileText, Package, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

export default function Home() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchImportHistory = useCallback(async (page: number = 1) => {
    try {
      const response = await importApi.getHistory({ page, limit: 10 });
      const data = response.data.data;
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch import history:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await importApi.getStats(7);
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchImportHistory(),
      fetchStats(),
    ]);
    setLoading(false);
  }, [fetchImportHistory, fetchStats]);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleTriggerImport = async () => {
    if (triggering) return;
    
    try {
      setTriggering(true);
      await importApi.triggerImport();
      alert('Import triggered successfully!');
      
      // Refresh data
      setTimeout(() => {
        fetchData();
      }, 2000);
    } catch (error) {
      alert('Failed to trigger import');
    } finally {
      setTriggering(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchImportHistory(newPage);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Import Dashboard</h2>
        <button
          onClick={handleTriggerImport}
          disabled={triggering}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${triggering ? 'animate-spin' : ''}`} />
          {triggering ? 'Triggering...' : 'Trigger Import'}
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Imports"
            value={stats.overall.totalImports}
            icon={<FileText className="h-6 w-6" />}
            description={`Last ${stats.period.days} days`}
            color="blue"
          />
          <StatsCard
            title="Jobs Imported"
            value={stats.overall.totalImported}
            icon={<Package className="h-6 w-6" />}
            description={`${stats.overall.totalNew} new, ${stats.overall.totalUpdated} updated`}
            color="green"
          />
          <StatsCard
            title="Success Rate"
            value={`${stats.overall.totalImports > 0 
              ? Math.round((stats.overall.successfulImports / stats.overall.totalImports) * 100) 
              : 0}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            description={`${stats.overall.successfulImports} successful`}
            color="green"
          />
          <StatsCard
            title="Failed Jobs"
            value={stats.overall.totalFailed}
            icon={<AlertCircle className="h-6 w-6" />}
            description={`${stats.overall.failedImports} failed imports`}
            color="red"
          />
        </div>
      )}

      {/* Queue Stats */}
      <QueueStats />

      {/* Import History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Import History
          </h3>
          
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No import history available
            </div>
          ) : (
            <>
              <ImportHistoryTable logs={logs} />
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
