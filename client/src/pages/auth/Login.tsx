import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/auth";

export default function Login() {
  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-graduation-cap text-primary-foreground text-2xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold" data-testid="login-title">
            Welcome to CampusAI
          </CardTitle>
          <CardDescription data-testid="login-description">
            Your AI-powered learning companion for academic success
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-2"
            data-testid="google-sign-in-button"
          >
            <i className="fab fa-google"></i>
            <span>Continue with Google</span>
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">What you'll get:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <i className="fas fa-check text-secondary text-xs"></i>
                <span>AI-powered study planning</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-check text-secondary text-xs"></i>
                <span>Adaptive quiz generation</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-check text-secondary text-xs"></i>
                <span>Peer collaboration matching</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-check text-secondary text-xs"></i>
                <span>Google Classroom integration</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
