import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export function IdeaMarketplaceCard() {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/ideas'],
    enabled: !!token,
  });

  const topIdeas = data?.ideas?.slice(0, 2) || [];

  return (
    <Card data-testid="idea-marketplace-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Idea Marketplace</CardTitle>
          <Link href="/idea-marketplace">
            <Button variant="ghost" size="sm" data-testid="view-all-ideas">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            [1, 2].map((i) => (
              <div key={i} className="p-3 bg-muted rounded-lg animate-pulse">
                <div className="h-4 bg-muted-foreground rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted-foreground rounded w-full mb-2"></div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-muted-foreground rounded w-16"></div>
                  <div className="h-3 bg-muted-foreground rounded w-8"></div>
                </div>
              </div>
            ))
          ) : topIdeas.length > 0 ? (
            topIdeas.map((idea: any) => (
              <div key={idea.id} className="p-3 bg-muted rounded-lg" data-testid={`idea-${idea.id}`}>
                <h4 className="text-sm font-medium text-foreground mb-1" data-testid={`idea-title-${idea.id}`}>
                  {idea.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-2" data-testid={`idea-description-${idea.id}`}>
                  {idea.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs" data-testid={`idea-category-${idea.id}`}>
                    📚 {idea.category}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <i className="fas fa-thumbs-up text-secondary text-xs"></i>
                    <span className="text-xs text-muted-foreground" data-testid={`idea-likes-${idea.id}`}>
                      {idea.likes || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No ideas yet</p>
          )}
        </div>
        
        <Link href="/idea-marketplace">
          <Button className="w-full mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="submit-idea-button">
            Submit Your Idea
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
