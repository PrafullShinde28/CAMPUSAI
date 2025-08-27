import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function Collaboration() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: allGroups, isLoading: loadingAllGroups } = useQuery({
    queryKey: ['/api/study-groups'],
    enabled: !!token,
  });

  const { data: myGroups, isLoading: loadingMyGroups } = useQuery({
    queryKey: ['/api/study-groups/my'],
    enabled: !!token,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: any) => {
      const response = await apiRequest('POST', '/api/study-groups', groupData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups/my'] });
      setShowCreateForm(false);
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiRequest('POST', `/api/study-groups/${groupId}/join`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-groups/my'] });
    },
  });

  const handleCreateGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const groupData = {
      name: formData.get('name'),
      subject: formData.get('subject'),
      description: formData.get('description'),
    };
    createGroupMutation.mutate(groupData);
  };

  const handleJoinGroup = (groupId: string) => {
    joinGroupMutation.mutate(groupId);
  };

  const allGroupsList = allGroups?.groups || [];
  const myGroupsList = myGroups?.groups || [];

  return (
    <div className="min-h-screen flex bg-background" data-testid="collaboration-page">
      <Sidebar isHidden={sidebarHidden} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onSidebarToggle={() => setSidebarHidden(!sidebarHidden)} title="Collaboration" />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Collaboration Hub</h1>
              <p className="text-muted-foreground">Connect with peers and join study groups</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} data-testid="create-group-button">
              <i className="fas fa-plus mr-2"></i>
              Create Group
            </Button>
          </div>

          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create Study Group</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Group Name</Label>
                    <Input name="name" id="name" required data-testid="group-name-input" />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input name="subject" id="subject" required data-testid="group-subject-input" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" id="description" data-testid="group-description-input" />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={createGroupMutation.isPending} data-testid="submit-group-button">
                      {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} data-testid="cancel-group-button">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Groups */}
            <div>
              <h2 className="text-xl font-semibold mb-4">My Study Groups</h2>
              <div className="space-y-4">
                {loadingMyGroups ? (
                  [1, 2].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6 animate-pulse">
                        <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : myGroupsList.length > 0 ? (
                  myGroupsList.map((group: any) => (
                    <Card key={group.id} data-testid={`my-group-${group.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1" data-testid={`my-group-name-${group.id}`}>
                              {group.name}
                            </h3>
                            <Badge variant="outline" className="mb-2" data-testid={`my-group-subject-${group.id}`}>
                              {group.subject}
                            </Badge>
                          </div>
                          <Badge className="bg-secondary/10 text-secondary" data-testid={`my-group-members-${group.id}`}>
                            {group.membersCount} members
                          </Badge>
                        </div>
                        {group.description && (
                          <p className="text-muted-foreground text-sm" data-testid={`my-group-description-${group.id}`}>
                            {group.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <i className="fas fa-users text-4xl text-muted-foreground mb-4"></i>
                      <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                      <p className="text-muted-foreground mb-4">Join or create your first study group</p>
                      <Button onClick={() => setShowCreateForm(true)} data-testid="empty-state-create-group">
                        Create Group
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Available Groups */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Groups</h2>
              <div className="space-y-4">
                {loadingAllGroups ? (
                  [1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6 animate-pulse">
                        <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-muted rounded w-full mb-4"></div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : allGroupsList.length > 0 ? (
                  allGroupsList.map((group: any) => (
                    <Card key={group.id} data-testid={`available-group-${group.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1" data-testid={`available-group-name-${group.id}`}>
                              {group.name}
                            </h3>
                            <Badge variant="outline" className="mb-2" data-testid={`available-group-subject-${group.id}`}>
                              {group.subject}
                            </Badge>
                          </div>
                          <Badge className="bg-primary/10 text-primary" data-testid={`available-group-members-${group.id}`}>
                            {group.membersCount} members
                          </Badge>
                        </div>
                        {group.description && (
                          <p className="text-muted-foreground text-sm mb-4" data-testid={`available-group-description-${group.id}`}>
                            {group.description}
                          </p>
                        )}
                        <Button 
                          size="sm" 
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={joinGroupMutation.isPending}
                          data-testid={`join-group-${group.id}`}
                        >
                          {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
                      <h3 className="text-lg font-semibold mb-2">No groups available</h3>
                      <p className="text-muted-foreground">Be the first to create a study group!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
