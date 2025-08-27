import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export function WelcomeSection() {
  const { user } = useAuth();

  return (
    <div className="mb-8" data-testid="welcome-section">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2" data-testid="welcome-title">
          Welcome back, {user?.name || "Student"}! 🎓
        </h1>
        <p className="text-primary-foreground/90 mb-4" data-testid="welcome-message">
          Ready to continue your learning journey? Check out your personalized study plan and upcoming tasks.
        </p>
        <Link href="/study-planner">
          <Button 
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            data-testid="view-study-plan-button"
          >
            View Study Plan
          </Button>
        </Link>
      </div>
    </div>
  );
}
