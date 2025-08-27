import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { StudyPlannerCard } from "@/components/dashboard/StudyPlannerCard";
import { QuizGeneratorCard } from "@/components/dashboard/QuizGeneratorCard";
import { CollaborationCard } from "@/components/dashboard/CollaborationCard";
import { IdeaMarketplaceCard } from "@/components/dashboard/IdeaMarketplaceCard";
import { LearningBuddyCard } from "@/components/dashboard/LearningBuddyCard";
import { AuthSuccessModal } from "@/components/auth/AuthSuccessModal";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Show auth modal if user just signed in
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success' || localStorage.getItem('justSignedIn')) {
      setShowAuthModal(true);
      localStorage.removeItem('justSignedIn');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarHidden(!sidebarHidden);
  };

  return (
    <div className="min-h-screen flex bg-background" data-testid="dashboard">
      <Sidebar isHidden={sidebarHidden} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onSidebarToggle={toggleSidebar} title="Dashboard" />
        
        <main className="flex-1 p-6 overflow-auto">
          <WelcomeSection />
          <QuickStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <StudyPlannerCard />
              <QuizGeneratorCard />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <CollaborationCard />
              <IdeaMarketplaceCard />
              <LearningBuddyCard />
            </div>
          </div>
        </main>
      </div>

      <AuthSuccessModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
