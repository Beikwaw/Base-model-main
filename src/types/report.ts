export interface DailyReport {
  date: Date;
  sleepovers: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
  };
  maintenance: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
  };
  complaints: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
  };
}

export interface DetailedReport extends DailyReport {
  sleepovers: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
    items: Array<{
      id: string;
      studentName: string;
      date: Date;
      status: 'resolved' | 'denied' | 'pending';
      details: string;
    }>;
  };
  maintenance: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
    items: Array<{
      id: string;
      studentName: string;
      date: Date;
      status: 'resolved' | 'denied' | 'pending';
      details: string;
    }>;
  };
  complaints: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
    items: Array<{
      id: string;
      studentName: string;
      date: Date;
      status: 'resolved' | 'denied' | 'pending';
      details: string;
    }>;
  };
} 