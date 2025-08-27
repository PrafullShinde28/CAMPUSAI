import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { queryClient } from "./lib/queryClient";

// Pages
import Dashboard from "@/pages/Dashboard";
import StudyPlanner from "@/pages/StudyPlanner";
import QuizGenerator from "@/pages/QuizGenerator";
import Collaboration from "@/pages/Collaboration";
import IdeaMarketplace from "@/pages/IdeaMarketplace";
import LearningBuddy from "@/pages/LearningBuddy";
import Login from "@/pages/auth/Login";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <i className="fas fa-graduation-cap text-primary-foreground text-2xl"></i>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading CampusAI...</h2>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Please wait</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <i className="fas fa-spinner fa-spin text-primary"></i>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    // Set flag to show auth success modal
    localStorage.setItem('justSignedIn', 'true');
    return <Redirect to="/?auth=success" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login">
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>

      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/study-planner">
        <ProtectedRoute>
          <StudyPlanner />
        </ProtectedRoute>
      </Route>
      
      <Route path="/quiz-generator">
        <ProtectedRoute>
          <QuizGenerator />
        </ProtectedRoute>
      </Route>
      
      <Route path="/collaboration">
        <ProtectedRoute>
          <Collaboration />
        </ProtectedRoute>
      </Route>
      
      <Route path="/idea-marketplace">
        <ProtectedRoute>
          <IdeaMarketplace />
        </ProtectedRoute>
      </Route>
      
      <Route path="/learning-buddy">
        <ProtectedRoute>
          <LearningBuddy />
        </ProtectedRoute>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
