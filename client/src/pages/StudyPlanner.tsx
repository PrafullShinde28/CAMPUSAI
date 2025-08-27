import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function StudyPlanner() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/study-plans'],
    enabled: !!token,
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const response = await apiRequest('POST', '/api/study-plans', planData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
      setShowCreateForm(false);
    },
  });

  const generatePlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/study-plans/generate', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
    },
  });

  const handleCreatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const planData = {
      title: formData.get('title'),
      description: formData.get('description'),
      scheduledAt: new Date(formData.get('scheduledAt') as string),
      duration: parseInt(formData.get('duration') as string),
      difficulty: formData.get('difficulty'),
    };
    createPlanMutation.mutate(planData);
  };

  const handleGenerateAIPlan = () => {
    generatePlanMutation.mutate({
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      availableHours: 20,
      goals: ['Improve test scores', 'Better understanding']
    });
  };

  const plans = data?.plans || [];

  return (
    <div className="min-h-screen flex bg-background" data-testid="study-planner-page">
      <Sidebar isHidden={sidebarHidden} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onSidebarToggle={() => setSidebarHidden(!sidebarHidden)} title="Study Planner" />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Study Planner</h1>
            <div className="space-x-2">
              <Button onClick={handleGenerateAIPlan} disabled={generatePlanMutation.isPending} data-testid="generate-ai-plan">
                {generatePlanMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-brain mr-2"></i>
                )}
                Generate AI Plan
              </Button>
              <Button onClick={() => setShowCreateForm(true)} data-testid="create-plan-button">
                <i className="fas fa-plus mr-2"></i>
                Create Plan
              </Button>
            </div>
          </div>

          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Study Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePlan} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input name="title" id="title" required data-testid="plan-title-input" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" id="description" data-testid="plan-description-input" />
                  </div>
                  <div>
                    <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                    <Input name="scheduledAt" id="scheduledAt" type="datetime-local" required data-testid="plan-datetime-input" />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input name="duration" id="duration" type="number" min="15" max="480" required data-testid="plan-duration-input" />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select name="difficulty" required>
                      <SelectTrigger data-testid="plan-difficulty-select">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={createPlanMutation.isPending} data-testid="submit-plan-button">
                      {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} data-testid="cancel-plan-button">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : plans.length > 0 ? (
              plans.map((plan: any) => (
                <Card key={plan.id} data-testid={`plan-card-${plan.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2" data-testid={`plan-title-${plan.id}`}>
                          {plan.title}
                        </h3>
                        {plan.description && (
                          <p className="text-muted-foreground mb-2" data-testid={`plan-description-${plan.id}`}>
                            {plan.description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground" data-testid={`plan-datetime-${plan.id}`}>
                          {format(new Date(plan.scheduledAt), 'PPP p')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="outline" data-testid={`plan-duration-${plan.id}`}>
                          {plan.duration}min
                        </Badge>
                        <Badge 
                          className={
                            plan.difficulty === 'Low' ? 'bg-primary/10 text-primary' :
                            plan.difficulty === 'Medium' ? 'bg-secondary/10 text-secondary' :
                            'bg-destructive/10 text-destructive'
                          }
                          data-testid={`plan-difficulty-${plan.id}`}
                        >
                          {plan.difficulty}
                        </Badge>
                        {plan.completed && (
                          <Badge className="bg-secondary/10 text-secondary" data-testid={`plan-completed-${plan.id}`}>
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <i className="fas fa-calendar-alt text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-semibold mb-2">No study plans yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first study plan or let AI generate one for you</p>
                  <Button onClick={() => setShowCreateForm(true)} data-testid="empty-state-create-plan">
                    Create Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
