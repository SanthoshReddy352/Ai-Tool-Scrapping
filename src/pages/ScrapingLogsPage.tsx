import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Clock, TrendingUp, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/db/supabase';

interface ScrapingLog {
  id: string;
  run_date: string;
  summary: {
    total_duration: number;
    scrapers_run: number;
    scrapers_successful: number;
    scrapers_failed: number;
    total_tools_added: number;
    total_duplicates: number;
    total_errors: number;
  };
  details: Array<{
    scraper: string;
    success: boolean;
    duration: number;
    results?: {
      total: number;
      added: number;
      duplicates: number;
      errors: number;
    };
    error?: string;
  }>;
  created_at: string;
}

const ScrapingLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRuns: 0,
    totalToolsAdded: 0,
    avgToolsPerRun: 0,
    successRate: 0
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('scraping_logs')
      .select('*')
      .order('run_date', { ascending: false })
      .limit(20);

    if (!error && data) {
      setLogs(data);
      calculateStats(data);
    }
    
    setLoading(false);
  };

  const calculateStats = (logs: ScrapingLog[]) => {
    const totalRuns = logs.length;
    const totalToolsAdded = logs.reduce((sum, log) => sum + (log.summary.total_tools_added || 0), 0);
    const successfulRuns = logs.filter(log => log.summary.scrapers_failed === 0).length;
    
    setStats({
      totalRuns,
      totalToolsAdded,
      avgToolsPerRun: totalRuns > 0 ? Math.round(totalToolsAdded / totalRuns) : 0,
      successRate: totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Scraping Logs</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor automated web scraping runs and performance metrics
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Total Runs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.totalRuns}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tools Added
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats.totalToolsAdded}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Avg Per Run
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.avgToolsPerRun}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Success Rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats.successRate}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Recent Runs</h2>
          
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48 bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Scraping Logs Yet</h3>
                <p className="text-muted-foreground">
                  Scraping logs will appear here once the automated scraping runs
                </p>
              </CardContent>
            </Card>
          ) : (
            logs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{formatDate(log.run_date)}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.summary.scrapers_failed === 0 ? (
                        <Badge variant="default" className="bg-accent">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          {log.summary.scrapers_failed} Failed
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {formatDuration(log.summary.total_duration)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Tools Added</div>
                      <div className="text-2xl font-bold text-accent">
                        {log.summary.total_tools_added}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Duplicates</div>
                      <div className="text-2xl font-bold text-foreground">
                        {log.summary.total_duplicates}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                      <div className="text-2xl font-bold text-destructive">
                        {log.summary.total_errors}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Scrapers</div>
                      <div className="text-2xl font-bold text-foreground">
                        {log.summary.scrapers_run}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-foreground mb-2">Scraper Details:</div>
                    {log.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {detail.success ? (
                            <CheckCircle className="h-4 w-4 text-accent" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="font-medium text-foreground">{detail.scraper}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {detail.results && (
                            <>
                              <span className="text-accent">+{detail.results.added}</span>
                              <span className="text-muted-foreground">
                                {detail.results.duplicates} dup
                              </span>
                              {detail.results.errors > 0 && (
                                <span className="text-destructive">
                                  {detail.results.errors} err
                                </span>
                              )}
                            </>
                          )}
                          <span className="text-muted-foreground">
                            {formatDuration(detail.duration)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrapingLogsPage;
