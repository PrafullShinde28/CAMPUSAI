import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { verifyFirebaseToken } from "./services/firebase-admin";
import { generateQuiz, generateStudyPlan, explainConcept, analyzeStudyPerformance } from "./services/gemini";
import { GoogleClassroomService } from "./services/google-classroom";
import { insertUserSchema, insertStudyPlanSchema, insertQuizSchema, insertStudyGroupSchema, insertIdeaSchema } from "@shared/schema";

// Middleware for authentication
async function authenticateUser(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.slice(7);
    const decodedToken = await verifyFirebaseToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Find or create user
    let user = await storage.getUserByFirebaseUid(decodedToken.uid);
    if (!user) {
      user = await storage.createUser({
        email: decodedToken.email!,
        name: decodedToken.name || decodedToken.email!.split("@")[0],
        profileImage: decodedToken.picture,
        firebaseUid: decodedToken.uid,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { idToken } = req.body;
      const decodedToken = await verifyFirebaseToken(idToken);
      
      if (!decodedToken) {
        return res.status(401).json({ message: "Invalid token" });
      }

      let user = await storage.getUserByFirebaseUid(decodedToken.uid);
      if (!user) {
        user = await storage.createUser({
          email: decodedToken.email!,
          name: decodedToken.name || decodedToken.email!.split("@")[0],
          profileImage: decodedToken.picture,
          firebaseUid: decodedToken.uid,
        });
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // User routes
  app.get("/api/user/profile", authenticateUser, async (req: any, res) => {
    res.json({ user: req.user });
  });

  app.put("/api/user/profile", authenticateUser, async (req: any, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.user.id, updates);
      res.json({ user });
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  // Study Plan routes
  app.get("/api/study-plans", authenticateUser, async (req: any, res) => {
    try {
      const plans = await storage.getStudyPlansByUser(req.user.id);
      res.json({ plans });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study plans" });
    }
  });

  app.post("/api/study-plans", authenticateUser, async (req: any, res) => {
    try {
      const planData = insertStudyPlanSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const plan = await storage.createStudyPlan(planData);
      res.json({ plan });
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.post("/api/study-plans/generate", authenticateUser, async (req: any, res) => {
    try {
      const { subjects, availableHours, goals } = req.body;
      const studyPlan = await generateStudyPlan(subjects, availableHours, goals);
      
      // Save generated plans to database
      const savedPlans = [];
      for (const item of studyPlan) {
        const plan = await storage.createStudyPlan({
          userId: req.user.id,
          title: item.title,
          description: item.description,
          scheduledAt: new Date(Date.now() + savedPlans.length * 24 * 60 * 60 * 1000), // Spread over days
          duration: item.duration,
          difficulty: item.difficulty,
        });
        savedPlans.push(plan);
      }
      
      res.json({ plans: savedPlans });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate study plan" });
    }
  });

  // Quiz routes
  app.get("/api/quizzes", authenticateUser, async (req: any, res) => {
    try {
      const quizzes = await storage.getQuizzesByUser(req.user.id);
      res.json({ quizzes });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.post("/api/quizzes/generate", authenticateUser, async (req: any, res) => {
    try {
      const { subject, difficulty, numQuestions = 5 } = req.body;
      const questions = await generateQuiz(subject, difficulty, numQuestions);
      
      const quiz = await storage.createQuiz({
        userId: req.user.id,
        title: `${subject} Quiz`,
        subject,
        questions,
        totalQuestions: questions.length,
      });
      
      res.json({ quiz });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  app.put("/api/quizzes/:id/complete", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { score } = req.body;
      
      const quiz = await storage.updateQuiz(id, {
        score,
        completed: true,
      });
      
      // Update user study points
      await storage.updateUser(req.user.id, {
        studyPoints: req.user.studyPoints + score * 10,
      });
      
      res.json({ quiz });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete quiz" });
    }
  });

  // Study Groups routes
  app.get("/api/study-groups", authenticateUser, async (req: any, res) => {
    try {
      const groups = await storage.getStudyGroups();
      res.json({ groups });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study groups" });
    }
  });

  app.get("/api/study-groups/my", authenticateUser, async (req: any, res) => {
    try {
      const groups = await storage.getStudyGroupsByUser(req.user.id);
      res.json({ groups });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user study groups" });
    }
  });

  app.post("/api/study-groups", authenticateUser, async (req: any, res) => {
    try {
      const groupData = insertStudyGroupSchema.parse({
        ...req.body,
        ownerId: req.user.id,
      });
      const group = await storage.createStudyGroup(groupData);
      res.json({ group });
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.post("/api/study-groups/:id/join", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.joinStudyGroup(id, req.user.id);
      res.json({ message: "Joined study group successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to join study group" });
    }
  });

  // Ideas routes
  app.get("/api/ideas", authenticateUser, async (req: any, res) => {
    try {
      const ideas = await storage.getIdeas();
      res.json({ ideas });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  });

  app.post("/api/ideas", authenticateUser, async (req: any, res) => {
    try {
      const ideaData = insertIdeaSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const idea = await storage.createIdea(ideaData);
      res.json({ idea });
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.post("/api/ideas/:id/like", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.likeIdea(id);
      res.json({ message: "Idea liked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to like idea" });
    }
  });

  // Learning Buddy routes
  app.post("/api/learning-buddy/explain", authenticateUser, async (req: any, res) => {
    try {
      const { concept, context } = req.body;
      const explanation = await explainConcept(concept, context);
      res.json({ explanation });
    } catch (error) {
      res.status(500).json({ message: "Failed to explain concept" });
    }
  });

  // Google Classroom integration
  app.get("/api/classroom/assignments", authenticateUser, async (req: any, res) => {
    try {
      const { accessToken } = req.query;
      if (!accessToken) {
        return res.status(400).json({ message: "Access token required" });
      }

      const classroomService = new GoogleClassroomService(accessToken as string);
      const assignments = await classroomService.getAssignments();
      res.json({ assignments });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classroom assignments" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", authenticateUser, async (req: any, res) => {
    try {
      const notifications = await storage.getNotifications(req.user.id);
      res.json({ notifications });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/performance", authenticateUser, async (req: any, res) => {
    try {
      const quizzes = await storage.getQuizzesByUser(req.user.id);
      const completedQuizzes = quizzes.filter(q => q.completed);
      const studyPlans = await storage.getStudyPlansByUser(req.user.id);
      
      const analysis = await analyzeStudyPerformance(
        completedQuizzes,
        studyPlans.reduce((total, plan) => total + (plan.duration || 0), 0) / 60 // Convert to hours
      );
      
      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze performance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
