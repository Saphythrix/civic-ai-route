import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserDashboard } from '@/components/user/UserDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Civic Sense</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {profile?.full_name || user.email}
            </p>
          </div>
          <Button onClick={signOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main>
        {profile?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;