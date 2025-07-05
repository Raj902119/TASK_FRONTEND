export interface ImportLog {
  _id: string;
  fileName: string;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  failedJobDetails?: FailedJobDetail[];
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: any;
  createdAt: string;
  updatedAt: string;
}

export interface FailedJobDetail {
  externalId: string;
  reason: string;
  error: any;
  timestamp: string;
}

export interface ImportStats {
  overall: {
    totalImports: number;
    totalFetched: number;
    totalImported: number;
    totalNew: number;
    totalUpdated: number;
    totalFailed: number;
    avgDuration: number;
    successfulImports: number;
    failedImports: number;
  };
  bySource: Array<{
    _id: string;
    imports: number;
    totalFetched: number;
    totalImported: number;
    avgDuration: number;
  }>;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
} 