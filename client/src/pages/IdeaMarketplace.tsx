import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function IdeaMarketplace() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/ideas'],
    enabled: !!token,
  });

  const submitIdeaMutation = useMutation({
    mutationFn: async (ideaData: any) => {
      const response = await apiRequest('POST', '/api/ideas', ideaData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setShowSubmitForm(false);
    },
  });

  const likeIdeaMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      const response = await apiRequest('POST', `/api/ideas/${ideaId}/like`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
    },
  });

  const handleSubmitIdea = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ideaData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
    };
    submitIdeaMutation.mutate(ideaData);
  };

  const handleLikeIdea = (ideaId: string) => {
    likeIdeaMutation.mutate(ideaId);
  };

  const ideas = data?.ideas || [];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'education': return '📚';
      case 'productivity': return '🎵';
      case 'technology': return '💻';
      case 'collaboration': return '🤝';
      default: return '💡';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'education': return 'bg-primary/10 text-primary';
      case 'productivity': return 'bg-accent/10 text-accent';
      case 'technology': return 'bg-secondary/10 text-secondary';
      case 'collaboration': return 'bg-chart-2/10 text-chart-2';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen flex bg-background" data-testid="idea-marketplace-page">
      <Sidebar isHidden={sidebarHidden} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onSidebarToggle={() => setSidebarHidden(!sidebarHidden)} title="Idea Marketplace" />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Idea Marketplace</h1>
              <p className="text-muted-foreground">Share and discover innovative educational ideas</p>
            </div>
            <Button onClick={() => setShowSubmitForm(true)} data-testid="submit-idea-button">
              <i className="fas fa-plus mr-2"></i>
              Submit Idea
            </Button>
          </div>

          {showSubmitForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Submit Your Idea</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitIdea} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input name="title" id="title" required data-testid="idea-title-input" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" id="description" required data-testid="idea-description-input" />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger data-testid="idea-category-select">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Productivity">Productivity</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Collaboration">Collaboration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={submitIdeaMutation.isPending} data-testid="submit-idea-form-button">
                      {submitIdeaMutation.isPending ? 'Submitting...' : 'Submit Idea'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowSubmitForm(false)} data-testid="cancel-idea-button">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-4"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-muted rounded w-20"></div>
                      <div className="h-6 bg-muted rounded w-12"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : ideas.length > 0 ? (
              ideas.map((idea: any) => (
                <Card key={idea.id} className="hover:shadow-md transition-shadow" data-testid={`idea-card-${idea.id}`}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2" data-testid={`idea-title-${idea.id}`}>
                      {idea.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4" data-testid={`idea-description-${idea.id}`}>
                      {idea.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge className={getCategoryColor(idea.category)} data-testid={`idea-category-${idea.id}`}>
                        {getCategoryIcon(idea.category)} {idea.category}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLikeIdea(idea.id)}
                        disabled={likeIdeaMutation.isPending}
                        data-testid={`like-idea-${idea.id}`}
                      >
                        <i className="fas fa-thumbs-up text-secondary mr-1"></i>
                        <span>{idea.likes || 0}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-12 text-center">
                    <i className="fas fa-lightbulb text-4xl text-muted-foreground mb-4"></i>
                    <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to share an innovative educational idea!</p>
                    <Button onClick={() => setShowSubmitForm(true)} data-testid="empty-state-submit-idea">
                      Submit Your Idea
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
