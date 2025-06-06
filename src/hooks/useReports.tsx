
import { useState, useEffect } from "react";
import { reportService, Report } from "@/services/reports/report.service";
import { toastService } from "@/services/toast/toast.service";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { supabase } from "@/integrations/supabase/client";

export const useReports = (reportType: Report["type"] = "task") => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<boolean>(false);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setIsAuthenticated(!!data.user);
        setAuthChecked(true);
      } catch (error) {
        console.warn('Auth check failed, possibly offline', error);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []);
  
  // Load reports of the specified type
  const loadReports = async () => {
    if (!isAuthenticated && authChecked) {
      console.warn('User is not authenticated. Cannot load reports.');
      return;
    }
    
    setIsLoading(true);
    setNetworkError(false);
    
    try {
      // First check if we're online
      if (!navigator.onLine) {
        console.warn('Device is offline, cannot load reports');
        setNetworkError(true);
        setReports([]);
        return;
      }
      
      const loadedReports = await reportService.getReportsByType(reportType);
      setReports(loadedReports);
    } catch (error: any) {
      console.error('Error loading reports:', error);
      
      // Check if it's a network error
      if (error.message && error.message.includes('Failed to fetch')) {
        setNetworkError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new report
  const createReport = async (reportData: Partial<Report>) => {
    if (!isAuthenticated) {
      toastService.error('Authentication Required', {
        description: 'Please log in to create reports.'
      });
      return null;
    }
    
    if (!reportData.name) {
      toastService.error('Report name is required');
      return null;
    }
    
    try {
      const newReport = await reportService.createReport({
        ...reportData,
        type: reportType,
        date_range: reportData.date_range || {
          start_date: dateRange.from?.toISOString() || null,
          end_date: dateRange.to?.toISOString() || null,
        }
      });
      
      // Refresh reports list
      await loadReports();
      return newReport;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  };
  
  // Generate a report without saving
  const generateReport = async (reportConfig: Partial<Report>) => {
    setIsGenerating(true);
    try {
      const result = await reportService.generateReport({
        ...reportConfig,
        type: reportType,
        date_range: reportConfig.date_range || {
          start_date: dateRange.from?.toISOString() || null,
          end_date: dateRange.to?.toISOString() || null,
        }
      });
      setReportData(result.data || []);
      return result;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Update date range filter
  const updateDateRange = (range: DateRange) => {
    setDateRange(range);
  };
  
  // Send a scheduled report immediately
  const sendReportNow = async (reportId: string) => {
    if (!isAuthenticated) {
      toastService.error('Authentication Required', {
        description: 'Please log in to send reports.'
      });
      return;
    }
    
    try {
      await reportService.sendReportNow(reportId);
      toastService.success('Report sent', {
        description: 'The report has been sent to recipients.'
      });
    } catch (error: any) {
      console.error('Error sending report:', error);
      toastService.error('Failed to send report', {
        description: error.message || 'An unknown error occurred'
      });
    }
  };
  
  return {
    reports,
    isLoading,
    selectedReport,
    setSelectedReport,
    reportData,
    dateRange,
    isGenerating,
    isAuthenticated,
    networkError,
    loadReports,
    createReport,
    generateReport,
    updateDateRange,
    sendReportNow
  };
};
