import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface AuthSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthSuccessModal({ isOpen, onClose }: AuthSuccessModalProps) {
  const { user } = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="auth-success-modal">
        <DialogHeader>
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check-circle text-secondary text-2xl"></i>
            </div>
            <DialogTitle className="text-xl font-bold mb-2" data-testid="modal-title">
              Welcome to CampusAI!
            </DialogTitle>
            <p className="text-muted-foreground mb-6" data-testid="modal-description">
              Authentication successful. You've been redirected to your personalized dashboard.
            </p>
          </div>
        </DialogHeader>
        
        {/* Google OAuth Integration Status */}
        <div className="bg-muted p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Google Integration</span>
            <Badge className="bg-secondary/10 text-secondary">Connected</Badge>
          </div>
          <div className="text-left space-y-2">
            <div className="flex items-center space-x-2">
              <i className="fas fa-check text-secondary text-xs"></i>
              <span className="text-xs text-muted-foreground">Google Classroom API</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-check text-secondary text-xs"></i>
              <span className="text-xs text-muted-foreground">Firebase Authentication</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-check text-secondary text-xs"></i>
              <span className="text-xs text-muted-foreground">AI Study Assistant</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onClose}
          className="w-full"
          data-testid="get-started-button"
        >
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
}
