import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export function QuickStats() {
  const { user, token } = useAuth();

  const { data: quizzes } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: !!token,
    refetchInterval: false,
  });

  const completedQuizzes = quizzes?.quizzes?.filter((q: any) => q.completed) || [];
  
  const stats = [
    {
      title: "Study Streak",
      value: `${user?.studyStreak || 0} days`,
      icon: "fas fa-fire",
      iconColor: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Quizzes Completed",
      value: completedQuizzes.length.toString(),
      icon: "fas fa-check-circle",
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Study Points",
      value: (user?.studyPoints || 0).toLocaleString(),
      icon: "fas fa-trophy",
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Collaboration Score",
      value: `${user?.collaborationScore || 0}%`,
      icon: "fas fa-users",
      iconColor: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="quick-stats">
      {stats.map((stat, index) => (
        <Card key={index} data-testid={`stat-card-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground" data-testid={`stat-title-${index}`}>
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                <i className={`${stat.icon} ${stat.iconColor}`}></i>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
