import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function LearningBuddy() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI Learning Buddy. I'm here to help explain complex concepts, answer questions, and guide you through your studies. What would you like to learn about today?",
      timestamp: new Date(),
    }
  ]);
  const { token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const explainMutation = useMutation({
    mutationFn: async (concept: string) => {
      const response = await apiRequest('POST', '/api/learning-buddy/explain', {
        concept,
        context: "",
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiResponse: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.explanation,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, aiResponse]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || !token) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage("");

    explainMutation.mutate(message);
  };

  const handleQuickQuestion = (topic: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `Explain ${topic}`,
      timestamp: new Date(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    explainMutation.mutate(topic);
  };

  const quickTopics = [
    { name: "Calculus Derivatives", topic: "calculus derivatives and their applications" },
    { name: "Physics Laws", topic: "Newton's laws of motion" },
    { name: "Chemistry Bonds", topic: "chemical bonding types" },
    { name: "Biology Cells", topic: "cell structure and function" },
    { name: "Statistics", topic: "basic statistical concepts" },
    { name: "Programming", topic: "programming fundamentals" },
  ];

  return (
    <div className="min-h-screen flex bg-background" data-testid="learning-buddy-page">
      <Sidebar isHidden={sidebarHidden} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onSidebarToggle={() => setSidebarHidden(!sidebarHidden)} title="Learning Buddy" />
        
        <main className="flex-1 p-6 overflow-hidden flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">AI Learning Buddy</h1>
            <p className="text-muted-foreground">Get personalized explanations and study help</p>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
            {/* Chat Interface */}
            <div className="lg:col-span-3 flex flex-col min-h-0">
              <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-robot text-primary-foreground text-sm"></i>
                    </div>
                    AI Learning Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0 p-6">
                  <ScrollArea className="flex-1 pr-4 mb-4">
                    <div className="space-y-4" data-testid="chat-messages">
                      {chatHistory.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${msg.id}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap" data-testid={`message-content-${msg.id}`}>
                              {msg.content}
                            </p>
                            <p className={`text-xs mt-1 opacity-70`}>
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {explainMutation.isPending && (
                        <div className="flex justify-start">
                          <div className="bg-muted text-foreground p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-spinner fa-spin text-sm"></i>
                              <span className="text-sm">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask me anything about your studies..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={explainMutation.isPending}
                      data-testid="chat-input"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || explainMutation.isPending}
                      data-testid="send-message-button"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Topics Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quickTopics.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="w-full justify-center p-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => handleQuickQuestion(topic.topic)}
                        data-testid={`quick-topic-${index}`}
                      >
                        {topic.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Study Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-lightbulb text-accent mt-0.5"></i>
                      <p>Ask specific questions for better explanations</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-book text-primary mt-0.5"></i>
                      <p>Request examples to understand concepts better</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-puzzle-piece text-secondary mt-0.5"></i>
                      <p>Break down complex topics into smaller parts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Mathematics', 'Physics', 'Chemistry', 'Biology'].map((subject, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleQuickQuestion(`${subject} concepts`)}
                        data-testid={`recent-subject-${index}`}
                      >
                        <i className="fas fa-book mr-2"></i>
                        {subject}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
