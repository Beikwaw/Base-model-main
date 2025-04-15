'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { generateDailyReport, generateDetailedReport } from '@/lib/firestore';
import type { DailyReport, DetailedReport } from '@/types/report';
import { Download, FileText } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';

interface DailyReportProps {
  tenantCode: string;
  date: Date;
}

export default function DailyReport({ tenantCode, date }: DailyReportProps) {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const dailyReport = await generateDailyReport(tenantCode, date);
      setReport(dailyReport);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetailedReport = async () => {
    setIsLoading(true);
    try {
      const detailed = await generateDetailedReport(tenantCode, date);
      setDetailedReport(detailed);
    } catch (error) {
      console.error('Error fetching detailed report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-500';
      case 'denied':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <Button onClick={fetchReport} className="w-full">
        Generate Daily Report
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Daily Report - {format(date, 'PPP')}</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={fetchDetailedReport}>
                <FileText className="mr-2 h-4 w-4" />
                View Detailed Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detailed Report - {format(date, 'PPP')}</DialogTitle>
              </DialogHeader>
              {detailedReport && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Sleepovers</h3>
                    <div className="space-y-2">
                      {detailedReport.sleepovers.items.map((item) => (
                        <div key={item.id} className="p-2 border rounded">
                          <div className="flex justify-between">
                            <span>{item.studentName}</span>
                            <span className={getStatusColor(item.status)}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Maintenance</h3>
                    <div className="space-y-2">
                      {detailedReport.maintenance.items.map((item) => (
                        <div key={item.id} className="p-2 border rounded">
                          <div className="flex justify-between">
                            <span>{item.studentName}</span>
                            <span className={getStatusColor(item.status)}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Complaints</h3>
                    <div className="space-y-2">
                      {detailedReport.complaints.items.map((item) => (
                        <div key={item.id} className="p-2 border rounded">
                          <div className="flex justify-between">
                            <span>{item.studentName}</span>
                            <span className={getStatusColor(item.status)}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {detailedReport && (
                    <div className="flex justify-end">
                      <PDFDownloadLink
                        document={<ReportPDF report={detailedReport} />}
                        fileName={`daily-report-${format(date, 'yyyy-MM-dd')}.pdf`}
                      >
                        {({ loading }) => (
                          <Button disabled={loading}>
                            <Download className="mr-2 h-4 w-4" />
                            {loading ? 'Generating PDF...' : 'Download PDF'}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Sleepovers</h3>
            <div className="space-y-1">
              <p>Total: {report.sleepovers.total}</p>
              <p className="text-green-500">Resolved: {report.sleepovers.resolved}</p>
              <p className="text-red-500">Denied: {report.sleepovers.denied}</p>
              <p className="text-yellow-500">Pending: {report.sleepovers.pending}</p>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Maintenance</h3>
            <div className="space-y-1">
              <p>Total: {report.maintenance.total}</p>
              <p className="text-green-500">Resolved: {report.maintenance.resolved}</p>
              <p className="text-red-500">Denied: {report.maintenance.denied}</p>
              <p className="text-yellow-500">Pending: {report.maintenance.pending}</p>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Complaints</h3>
            <div className="space-y-1">
              <p>Total: {report.complaints.total}</p>
              <p className="text-green-500">Resolved: {report.complaints.resolved}</p>
              <p className="text-red-500">Denied: {report.complaints.denied}</p>
              <p className="text-yellow-500">Pending: {report.complaints.pending}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 