import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export function QuizGeneratorCard() {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: !!token,
  });

  const recentQuizzes = data?.quizzes?.filter((q: any) => q.completed).slice(0, 3) || [];

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'text-secondary';
    if (percentage >= 75) return 'text-accent';
    return 'text-muted-foreground';
  };

  return (
    <Card data-testid="quiz-generator-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Quiz Generator</CardTitle>
          <Link href="/quiz-generator">
            <Button data-testid="generate-quiz-button">
              Generate Quiz
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Recent Quizzes</h4>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between text-sm animate-pulse">
                    <div className="h-4 bg-muted-foreground rounded w-1/2"></div>
                    <div className="h-4 bg-muted-foreground rounded w-8"></div>
                  </div>
                ))}
              </div>
            ) : recentQuizzes.length > 0 ? (
              <div className="space-y-2">
                {recentQuizzes.map((quiz: any) => (
                  <div key={quiz.id} className="flex justify-between text-sm" data-testid={`recent-quiz-${quiz.id}`}>
                    <span className="text-muted-foreground" data-testid={`quiz-title-${quiz.id}`}>
                      {quiz.title}
                    </span>
                    <span 
                      className={`font-medium ${getScoreColor(quiz.score || 0, quiz.totalQuestions)}`}
                      data-testid={`quiz-score-${quiz.id}`}
                    >
                      {quiz.score ? Math.round((quiz.score / quiz.totalQuestions) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No completed quizzes yet</p>
            )}
          </div>
          
          <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">AI Recommendations</h4>
            <p className="text-sm text-muted-foreground mb-3">Based on your performance, focus on:</p>
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary">Study Strategies</Badge>
              <Badge className="bg-secondary/10 text-secondary ml-2">Review Materials</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
