import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function QuizGenerator() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: !!token,
  });

  const generateQuizMutation = useMutation({
    mutationFn: async (quizData: any) => {
      const response = await apiRequest('POST', '/api/quizzes/generate', quizData);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentQuiz(data.quiz);
      setAnswers({});
      setShowResults(false);
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
    },
  });

  const completeQuizMutation = useMutation({
    mutationFn: async ({ quizId, score }: { quizId: string; score: number }) => {
      const response = await apiRequest('PUT', `/api/quizzes/${quizId}/complete`, { score });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
    },
  });

  const handleGenerateQuiz = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quizData = {
      subject: formData.get('subject'),
      difficulty: formData.get('difficulty'),
      numQuestions: parseInt(formData.get('numQuestions') as string),
    };
    generateQuizMutation.mutate(quizData);
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;
    
    let correctAnswers = 0;
    currentQuiz.questions.forEach((question: any, index: number) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    completeQuizMutation.mutate({
      quizId: currentQuiz.id,
      score: correctAnswers,
    });
    
    setShowResults(true);
  };

  const quizzes = data?.quizzes || [];

  return (
    <div className="min-h-screen flex bg-background" data-testid="quiz-generator-page">
      <Sidebar isHidden={sidebarHidden} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onSidebarToggle={() => setSidebarHidden(!sidebarHidden)} title="Quiz Generator" />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">AI Quiz Generator</h1>
            <p className="text-muted-foreground">Generate personalized quizzes with AI</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quiz Generation Form */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Generate New Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerateQuiz} className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input name="subject" id="subject" placeholder="e.g., Mathematics, Physics" required data-testid="quiz-subject-input" />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select name="difficulty" required>
                        <SelectTrigger data-testid="quiz-difficulty-select">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="numQuestions">Number of Questions</Label>
                      <Select name="numQuestions" required>
                        <SelectTrigger data-testid="quiz-questions-select">
                          <SelectValue placeholder="Select number" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="15">15 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={generateQuizMutation.isPending} data-testid="generate-quiz-submit">
                      {generateQuizMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Generating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-brain mr-2"></i>
                          Generate Quiz
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quiz History */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="p-3 border rounded-lg animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))
                    ) : quizzes.slice(0, 5).map((quiz: any) => (
                      <div key={quiz.id} className="p-3 border rounded-lg" data-testid={`quiz-history-${quiz.id}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm" data-testid={`quiz-history-title-${quiz.id}`}>
                              {quiz.title}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`quiz-history-subject-${quiz.id}`}>
                              {quiz.subject}
                            </p>
                          </div>
                          {quiz.completed && (
                            <Badge variant="outline" data-testid={`quiz-history-score-${quiz.id}`}>
                              {Math.round((quiz.score / quiz.totalQuestions) * 100)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Quiz */}
            <div className="lg:col-span-2">
              {currentQuiz ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle data-testid="current-quiz-title">{currentQuiz.title}</CardTitle>
                      <Badge variant="outline" data-testid="current-quiz-subject">
                        {currentQuiz.subject}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showResults ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check-circle text-secondary text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-bold mb-2" data-testid="quiz-results-title">Quiz Completed!</h3>
                        <p className="text-muted-foreground mb-4" data-testid="quiz-results-score">
                          You scored {Object.values(answers).filter((answer, index) => 
                            answer === currentQuiz.questions[index].correctAnswer
                          ).length} out of {currentQuiz.questions.length}
                        </p>
                        <Button onClick={() => setCurrentQuiz(null)} data-testid="new-quiz-button">
                          Generate New Quiz
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentQuiz.questions.map((question: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg" data-testid={`question-${index}`}>
                            <h4 className="font-medium mb-4" data-testid={`question-text-${index}`}>
                              {index + 1}. {question.question}
                            </h4>
                            <RadioGroup
                              value={answers[index]?.toString()}
                              onValueChange={(value) => setAnswers({ ...answers, [index]: parseInt(value) })}
                            >
                              {question.options.map((option: string, optionIndex: number) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <RadioGroupItem 
                                    value={optionIndex.toString()} 
                                    id={`q${index}-option${optionIndex}`}
                                    data-testid={`question-${index}-option-${optionIndex}`}
                                  />
                                  <Label htmlFor={`q${index}-option${optionIndex}`} className="flex-1">
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        ))}
                        
                        <Button 
                          onClick={handleSubmitQuiz}
                          className="w-full"
                          disabled={Object.keys(answers).length !== currentQuiz.questions.length || completeQuizMutation.isPending}
                          data-testid="submit-quiz-button"
                        >
                          {completeQuizMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <i className="fas fa-brain text-4xl text-muted-foreground mb-4"></i>
                    <h3 className="text-lg font-semibold mb-2">Generate Your First Quiz</h3>
                    <p className="text-muted-foreground">Use the form on the left to create an AI-powered quiz</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
