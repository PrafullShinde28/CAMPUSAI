import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export function LearningBuddyCard() {
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const { token } = useAuth();

  const explainMutation = useMutation({
    mutationFn: async (concept: string) => {
      const response = await apiRequest('POST', '/api/learning-buddy/explain', {
        concept,
        context: "",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setExplanation(data.explanation);
    },
  });

  const handleAskQuestion = async () => {
    if (question.trim() && token) {
      explainMutation.mutate(question);
      setQuestion("");
    }
  };

  const handleQuickQuestion = (topic: string) => {
    explainMutation.mutate(topic);
  };

  return (
    <Card data-testid="learning-buddy-card">
      <CardHeader>
        <CardTitle>Learning Buddy AI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-robot text-primary-foreground text-xs"></i>
            </div>
            <div>
              {explanation ? (
                <div className="text-sm text-foreground mb-2" data-testid="ai-explanation">
                  {explanation}
                </div>
              ) : (
                <p className="text-sm text-foreground mb-2">
                  Ready to help explain complex concepts! What would you like to learn about today?
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/20" 
                  onClick={() => handleQuickQuestion("Calculus derivatives")}
                  data-testid="quick-topic-calculus"
                >
                  Calculus
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary/20" 
                  onClick={() => handleQuickQuestion("Physics mechanics")}
                  data-testid="quick-topic-physics"
                >
                  Physics
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent/20" 
                  onClick={() => handleQuickQuestion("Chemistry organic compounds")}
                  data-testid="quick-topic-chemistry"
                >
                  Chemistry
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything..."
            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
            disabled={explainMutation.isPending}
            data-testid="learning-buddy-input"
          />
          <Button 
            onClick={handleAskQuestion}
            disabled={!question.trim() || explainMutation.isPending}
            data-testid="send-question-button"
          >
            {explainMutation.isPending ? (
              <i className="fas fa-spinner fa-spin text-sm"></i>
            ) : (
              <i className="fas fa-paper-plane text-sm"></i>
            )}
          </Button>
        </div>

        <Link href="/learning-buddy">
          <Button variant="outline" className="w-full mt-4" data-testid="open-full-chat">
            Open Full Chat
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
