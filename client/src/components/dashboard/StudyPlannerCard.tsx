import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { format, isToday } from "date-fns";

export function StudyPlannerCard() {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/study-plans'],
    enabled: !!token,
  });

  const todaysTasks = data?.plans?.filter((plan: any) => 
    isToday(new Date(plan.scheduledAt)) && !plan.completed
  ).slice(0, 3) || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'low': return 'bg-primary/10 text-primary';
      case 'medium': return 'bg-secondary/10 text-secondary';
      case 'high': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <Card data-testid="study-planner-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Study Planner</CardTitle>
          <Link href="/study-planner">
            <Button variant="ghost" size="sm" data-testid="view-all-plans">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-muted rounded-lg animate-pulse">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted-foreground rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted-foreground rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : todaysTasks.length > 0 ? (
          <div className="space-y-3">
            {todaysTasks.map((task: any) => (
              <div key={task.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg" data-testid={`task-${task.id}`}>
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground" data-testid={`task-title-${task.id}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`task-time-${task.id}`}>
                    {format(new Date(task.scheduledAt), 'h:mm a')} - {task.duration ? `${task.duration}min` : ''}
                  </p>
                </div>
                <Badge className={getDifficultyColor(task.difficulty)} data-testid={`task-difficulty-${task.id}`}>
                  {task.difficulty || 'Medium'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No tasks scheduled for today</p>
            <Link href="/study-planner">
              <Button data-testid="create-study-plan">Create Study Plan</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
