import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ReportIssue } from './ReportIssue';
import { MapPin, Calendar, Tag } from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  ai_category: string;
  ai_confidence: number;
  image_url: string;
  address: string;
  created_at: string;
}

export const UserDashboard: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserIssues();
    }
  }, [user]);

  const fetchUserIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error: any) {
      console.error('Error fetching issues:', error);
      toast({
        title: "Error",
        description: "Failed to load your issues.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'in-progress':
        return 'bg-primary text-primary-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Civic Sense Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab('report')}
            variant={activeTab === 'report' ? 'default' : 'outline'}
          >
            Report Issue
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'default' : 'outline'}
          >
            My Reports
          </Button>
        </div>
      </div>

      {activeTab === 'report' && (
        <div className="flex justify-center">
          <ReportIssue />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Reported Issues</h2>
            <Badge variant="secondary">{issues.length} Total Issues</Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading your issues...</div>
          ) : issues.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No issues reported yet.</p>
                <Button
                  onClick={() => setActiveTab('report')}
                  className="mt-4"
                >
                  Report Your First Issue
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {issues.map((issue) => (
                <Card key={issue.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(issue.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {issue.address}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">Description:</p>
                        <p>{issue.description}</p>
                        
                        {issue.ai_category && (
                          <div className="flex items-center gap-2 mt-3">
                            <Tag className="h-4 w-4" />
                            <span className="text-sm">
                              AI Category: <strong>{issue.ai_category}</strong>
                              {issue.ai_confidence > 0 && (
                                <span className="text-muted-foreground ml-1">
                                  ({issue.ai_confidence}% confidence)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {issue.image_url && (
                        <div className="w-full md:w-48">
                          <img
                            src={issue.image_url}
                            alt="Issue"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};