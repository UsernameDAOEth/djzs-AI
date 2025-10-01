import { type User, type InsertUser, type NewsletterIssue, type InsertNewsletterIssue } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Newsletter issues
  getAllNewsletterIssues(): Promise<NewsletterIssue[]>;
  getPublishedNewsletterIssues(): Promise<NewsletterIssue[]>;
  getNewsletterIssue(id: string): Promise<NewsletterIssue | undefined>;
  getNewsletterIssueByNumber(issueNumber: number): Promise<NewsletterIssue | undefined>;
  createNewsletterIssue(issue: InsertNewsletterIssue): Promise<NewsletterIssue>;
  updateNewsletterIssue(id: string, issue: Partial<NewsletterIssue>): Promise<NewsletterIssue | undefined>;
  deleteNewsletterIssue(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private newsletterIssues: Map<string, NewsletterIssue>;

  constructor() {
    this.users = new Map();
    this.newsletterIssues = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllNewsletterIssues(): Promise<NewsletterIssue[]> {
    return Array.from(this.newsletterIssues.values()).sort(
      (a, b) => b.issueNumber - a.issueNumber
    );
  }

  async getPublishedNewsletterIssues(): Promise<NewsletterIssue[]> {
    return Array.from(this.newsletterIssues.values())
      .filter(issue => issue.isPublished)
      .sort((a, b) => b.issueNumber - a.issueNumber);
  }

  async getNewsletterIssue(id: string): Promise<NewsletterIssue | undefined> {
    return this.newsletterIssues.get(id);
  }

  async getNewsletterIssueByNumber(issueNumber: number): Promise<NewsletterIssue | undefined> {
    return Array.from(this.newsletterIssues.values()).find(
      (issue) => issue.issueNumber === issueNumber
    );
  }

  async createNewsletterIssue(insertIssue: InsertNewsletterIssue): Promise<NewsletterIssue> {
    const existing = await this.getNewsletterIssueByNumber(insertIssue.issueNumber);
    if (existing) {
      throw new Error("DUPLICATE_ISSUE_NUMBER");
    }
    
    const id = randomUUID();
    const issue: NewsletterIssue = {
      id,
      ...insertIssue,
      publishedAt: new Date(),
      isPublished: insertIssue.isPublished ?? false,
    };
    this.newsletterIssues.set(id, issue);
    return issue;
  }

  async updateNewsletterIssue(id: string, updates: Partial<NewsletterIssue>): Promise<NewsletterIssue | undefined> {
    const existing = this.newsletterIssues.get(id);
    if (!existing) return undefined;
    
    const { id: _, ...safeUpdates } = updates;
    const updated = { ...existing, ...safeUpdates };
    this.newsletterIssues.set(id, updated);
    return updated;
  }

  async deleteNewsletterIssue(id: string): Promise<boolean> {
    return this.newsletterIssues.delete(id);
  }
}

export const storage = new MemStorage();
