import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export function CollaborationCard() {
  const { token } = useAuth();

  const { data: groupsData } = useQuery({
    queryKey: ['/api/study-groups/my'],
    enabled: !!token,
  });

  const activeGroups = groupsData?.groups?.slice(0, 2) || [];

  return (
    <Card data-testid="collaboration-card">
      <CardHeader>
        <CardTitle>Collaboration Hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Study Groups */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Active Study Groups</h4>
          <div className="space-y-2">
            {activeGroups.length > 0 ? (
              activeGroups.map((group: any) => (
                <div key={group.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer" data-testid={`study-group-${group.id}`}>
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-users text-primary text-xs"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground" data-testid={`group-name-${group.id}`}>
                      {group.name}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`group-members-${group.id}`}>
                      {group.membersCount} members
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No active study groups</p>
            )}
          </div>
        </div>
        
        {/* Peer Matching */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Suggested Matches</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer" data-testid="suggested-match">
              <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-secondary text-xs"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Find Study Partners</p>
                <p className="text-xs text-muted-foreground">Based on your subjects</p>
              </div>
              <Button size="sm" variant="outline" data-testid="find-partners-button">
                Connect
              </Button>
            </div>
          </div>
        </div>

        <Link href="/collaboration">
          <Button className="w-full" variant="outline" data-testid="view-collaboration">
            View All Groups
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
