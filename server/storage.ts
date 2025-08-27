import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, or, sql } from "drizzle-orm";
import {
  users,
  studyPlans,
  quizzes,
  studyGroups,
  studyGroupMembers,
  ideas,
  peerMatches,
  notifications,
  type User,
  type InsertUser,
  type StudyPlan,
  type InsertStudyPlan,
  type Quiz,
  type InsertQuiz,
  type StudyGroup,
  type InsertStudyGroup,
  type Idea,
  type InsertIdea,
  type Notification,
  type InsertNotification,
  type PeerMatch,
} from "@shared/schema";

const sql_client = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_client);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Study Plans
  getStudyPlansByUser(userId: string): Promise<StudyPlan[]>;
  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;
  updateStudyPlan(id: string, updates: Partial<InsertStudyPlan>): Promise<StudyPlan | undefined>;
  
  // Quizzes
  getQuizzesByUser(userId: string): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  
  // Study Groups
  getStudyGroups(): Promise<StudyGroup[]>;
  getStudyGroupsByUser(userId: string): Promise<StudyGroup[]>;
  createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup>;
  joinStudyGroup(groupId: string, userId: string): Promise<void>;
  
  // Ideas
  getIdeas(): Promise<Idea[]>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  likeIdea(ideaId: string): Promise<void>;
  
  // Peer Matches
  getPeerMatches(userId: string): Promise<PeerMatch[]>;
  
  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getStudyPlansByUser(userId: string): Promise<StudyPlan[]> {
    return await db.select().from(studyPlans)
      .where(eq(studyPlans.userId, userId))
      .orderBy(desc(studyPlans.scheduledAt));
  }

  async createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan> {
    const result = await db.insert(studyPlans).values(plan).returning();
    return result[0];
  }

  async updateStudyPlan(id: string, updates: Partial<InsertStudyPlan>): Promise<StudyPlan | undefined> {
    const result = await db.update(studyPlans).set(updates).where(eq(studyPlans.id, id)).returning();
    return result[0];
  }

  async getQuizzesByUser(userId: string): Promise<Quiz[]> {
    return await db.select().from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.createdAt));
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const result = await db.insert(quizzes).values(quiz).returning();
    return result[0];
  }

  async updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const result = await db.update(quizzes).set(updates).where(eq(quizzes.id, id)).returning();
    return result[0];
  }

  async getStudyGroups(): Promise<StudyGroup[]> {
    return await db.select().from(studyGroups)
      .where(eq(studyGroups.isActive, true))
      .orderBy(desc(studyGroups.createdAt));
  }

  async getStudyGroupsByUser(userId: string): Promise<StudyGroup[]> {
    return await db.select({
      id: studyGroups.id,
      name: studyGroups.name,
      subject: studyGroups.subject,
      description: studyGroups.description,
      ownerId: studyGroups.ownerId,
      membersCount: studyGroups.membersCount,
      isActive: studyGroups.isActive,
      createdAt: studyGroups.createdAt,
    }).from(studyGroups)
      .innerJoin(studyGroupMembers, eq(studyGroups.id, studyGroupMembers.groupId))
      .where(and(
        eq(studyGroupMembers.userId, userId),
        eq(studyGroups.isActive, true)
      ));
  }

  async createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup> {
    const result = await db.insert(studyGroups).values(group).returning();
    // Add creator as first member
    await db.insert(studyGroupMembers).values({
      groupId: result[0].id,
      userId: group.ownerId,
    });
    return result[0];
  }

  async joinStudyGroup(groupId: string, userId: string): Promise<void> {
    await db.insert(studyGroupMembers).values({
      groupId,
      userId,
    });
    // Update member count
    await db.update(studyGroups)
      .set({
        membersCount: sql`${studyGroups.membersCount} + 1`,
      })
      .where(eq(studyGroups.id, groupId));
  }

  async getIdeas(): Promise<Idea[]> {
    return await db.select().from(ideas).orderBy(desc(ideas.createdAt));
  }

  async createIdea(idea: InsertIdea): Promise<Idea> {
    const result = await db.insert(ideas).values(idea).returning();
    return result[0];
  }

  async likeIdea(ideaId: string): Promise<void> {
    await db.update(ideas)
      .set({
        likes: sql`${ideas.likes} + 1`,
      })
      .where(eq(ideas.id, ideaId));
  }

  async getPeerMatches(userId: string): Promise<PeerMatch[]> {
    return await db.select().from(peerMatches)
      .where(eq(peerMatches.userId, userId))
      .orderBy(desc(peerMatches.compatibility));
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DbStorage();
