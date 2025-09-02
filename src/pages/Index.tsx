import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Camera, Users, Shield } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

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

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Civic <span className="text-primary">Sense</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Report civic issues in your community and help make your city better. 
              AI-powered issue classification and routing for faster resolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <a href="/auth">Get Started</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple, fast, and effective civic issue reporting
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Camera className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Take a Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Capture the civic issue with your phone camera for clear documentation
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Add Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Use GPS to pinpoint the exact location of the issue on the map
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>AI Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our AI automatically categorizes your issue for faster routing
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Department Routing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Issues are automatically routed to the appropriate city department
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of citizens helping to improve their communities
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <a href="/auth">Start Reporting Issues</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            © 2024 Civic Sense. Making cities better, one report at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
