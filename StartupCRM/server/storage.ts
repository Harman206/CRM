import { 
  users, clients, templates, followUps, messages,
  type User, type InsertUser,
  type Client, type InsertClient,
  type Template, type InsertTemplate,
  type FollowUp, type InsertFollowUp,
  type Message, type InsertMessage
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clients
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Templates
  getTemplates(userId: number): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;

  // Follow-ups
  getFollowUps(userId: number): Promise<FollowUp[]>;
  getFollowUp(id: number): Promise<FollowUp | undefined>;
  getUpcomingFollowUps(userId: number): Promise<FollowUp[]>;
  getOverdueFollowUps(userId: number): Promise<FollowUp[]>;
  createFollowUp(followUp: InsertFollowUp): Promise<FollowUp>;
  updateFollowUp(id: number, followUp: Partial<InsertFollowUp>): Promise<FollowUp | undefined>;
  deleteFollowUp(id: number): Promise<boolean>;

  // Messages
  getMessages(userId: number): Promise<Message[]>;
  getClientMessages(clientId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<InsertMessage>): Promise<Message | undefined>;

  // Dashboard stats
  getDashboardStats(userId: number): Promise<{
    totalClients: number;
    pendingFollowUps: number;
    sentThisWeek: number;
    responseRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private templates: Map<number, Template>;
  private followUps: Map<number, FollowUp>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentClientId: number;
  private currentTemplateId: number;
  private currentFollowUpId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.templates = new Map();
    this.followUps = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentTemplateId = 1;
    this.currentFollowUpId = 1;
    this.currentMessageId = 1;

    // Initialize with demo user and data
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo user
    await this.createUser({
      username: "sarah",
      password: "password",
      email: "sarah@startup.com",
      name: "Sarah Chen"
    });

    // Create demo clients
    const client1 = await this.createClient({
      userId: 1,
      name: "Alex Rodriguez",
      email: "alex.rodriguez@techcorp.com",
      company: "TechCorp Solutions",
      linkedinUrl: "https://linkedin.com/in/alexrodriguez",
      phone: "+1 (555) 123-4567",
      notes: "Interested in our enterprise package. Previously worked at Google.",
      preferredChannel: "email"
    });

    const client2 = await this.createClient({
      userId: 1,
      name: "Jennifer Kim",
      email: "j.kim@innovatestartup.io",
      company: "Innovate Startup",
      linkedinUrl: "https://linkedin.com/in/jenniferkim",
      phone: "+1 (555) 987-6543",
      notes: "CEO of fast-growing startup. Very interested in our AI features.",
      preferredChannel: "linkedin"
    });

    const client3 = await this.createClient({
      userId: 1,
      name: "Michael Thompson",
      email: "mthompson@globalenterprises.com",
      company: "Global Enterprises",
      linkedinUrl: "https://linkedin.com/in/michaelthompson",
      phone: "+1 (555) 456-7890",
      notes: "Director of Operations. Looking for scalable solutions.",
      preferredChannel: "email"
    });

    // Create demo templates
    await this.createTemplate({
      userId: 1,
      name: "Product Demo Follow-up",
      category: "follow-up",
      channel: "email",
      subject: "Thanks for your interest in {{product_name}}",
      content: "Hi {{client_name}},\n\nThank you for taking the time to learn about {{product_name}} during our demo yesterday. I hope you found the presentation valuable and could see how our solution could benefit {{company}}.\n\nAs discussed, here are the next steps:\n• Review the proposal I've attached\n• Schedule a technical deep-dive with your team\n• Discuss implementation timeline\n\nI'm available this week if you have any questions or would like to move forward.\n\nBest regards,\n{{sender_name}}"
    });

    await this.createTemplate({
      userId: 1,
      name: "LinkedIn Introduction",
      category: "introduction",
      channel: "linkedin",
      subject: "",
      content: "Hi {{client_name}}, I noticed you're working on innovative solutions at {{company}}. I'd love to connect and share how we're helping similar companies streamline their workflows with AI-powered tools. Would you be open to a brief conversation?"
    });

    await this.createTemplate({
      userId: 1,
      name: "Check-in Message",
      category: "check-in",
      channel: "both",
      subject: "How are things going at {{company}}?",
      content: "Hi {{client_name}},\n\nI hope you're having a great week! I wanted to check in and see how things are progressing with your current projects at {{company}}.\n\nHave you had a chance to consider our previous discussion about implementing our solution? I'm here to answer any questions or provide additional information that might be helpful.\n\nLooking forward to hearing from you!\n\nBest,\n{{sender_name}}"
    });

    // Create demo follow-ups
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await this.createFollowUp({
      userId: 1,
      clientId: client1.id,
      subject: "Follow up on enterprise package discussion",
      content: "Hi Alex, I wanted to follow up on our conversation about the enterprise package for TechCorp Solutions. Have you had a chance to review the proposal?",
      channel: "email",
      priority: "high",
      status: "pending",
      scheduledFor: tomorrow,
      context: "Discussed enterprise package pricing and features during last call"
    });

    await this.createFollowUp({
      userId: 1,
      clientId: client2.id,
      subject: "AI features demo follow-up",
      content: "Hi Jennifer, thanks for the great questions about our AI capabilities. I'd love to schedule a technical deep-dive for your team.",
      channel: "linkedin",
      priority: "medium",
      status: "pending",
      scheduledFor: nextWeek,
      context: "Very interested in AI features for startup automation"
    });

    // Create an overdue follow-up
    await this.createFollowUp({
      userId: 1,
      clientId: client3.id,
      subject: "Checking in on Global Enterprises integration",
      content: "Hi Michael, I wanted to check in on the status of your evaluation process for our platform.",
      channel: "email",
      priority: "medium",
      status: "pending",
      scheduledFor: yesterday,
      context: "Evaluating platform for operations team"
    });

    // Create some sent messages for stats
    await this.createMessage({
      userId: 1,
      clientId: client1.id,
      channel: "email",
      subject: "Welcome to our platform!",
      content: "Hi Alex, welcome to our platform! Here's everything you need to get started.",
      status: "sent",
      responseReceived: true
    });

    await this.createMessage({
      userId: 1,
      clientId: client2.id,
      channel: "linkedin", 
      subject: null,
      content: "Thanks for connecting! Looking forward to our partnership.",
      status: "sent",
      responseReceived: false
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Clients
  async getClients(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(client => client.userId === userId);
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = { 
      ...insertClient,
      company: insertClient.company || null,
      linkedinUrl: insertClient.linkedinUrl || null,
      phone: insertClient.phone || null,
      notes: insertClient.notes || null,
      preferredChannel: insertClient.preferredChannel || "email",
      id, 
      createdAt: new Date()
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updated = { ...client, ...updateData };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Templates
  async getTemplates(userId: number): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(template => template.userId === userId);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const template: Template = { 
      ...insertTemplate,
      subject: insertTemplate.subject || null,
      variables: insertTemplate.variables || [],
      id, 
      createdAt: new Date()
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: number, updateData: Partial<InsertTemplate>): Promise<Template | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;
    
    const updated = { ...template, ...updateData };
    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Follow-ups
  async getFollowUps(userId: number): Promise<FollowUp[]> {
    return Array.from(this.followUps.values()).filter(followUp => followUp.userId === userId);
  }

  async getFollowUp(id: number): Promise<FollowUp | undefined> {
    return this.followUps.get(id);
  }

  async getUpcomingFollowUps(userId: number): Promise<FollowUp[]> {
    const now = new Date();
    return Array.from(this.followUps.values())
      .filter(followUp => 
        followUp.userId === userId && 
        followUp.status === 'pending' && 
        followUp.scheduledFor >= now
      )
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  async getOverdueFollowUps(userId: number): Promise<FollowUp[]> {
    const now = new Date();
    return Array.from(this.followUps.values())
      .filter(followUp => 
        followUp.userId === userId && 
        followUp.status === 'pending' && 
        followUp.scheduledFor < now
      );
  }

  async createFollowUp(insertFollowUp: InsertFollowUp): Promise<FollowUp> {
    const id = this.currentFollowUpId++;
    const followUp: FollowUp = { 
      ...insertFollowUp,
      content: insertFollowUp.content || null,
      context: insertFollowUp.context || null,
      templateId: insertFollowUp.templateId || null,
      status: insertFollowUp.status || "pending",
      priority: insertFollowUp.priority || "medium",
      id, 
      createdAt: new Date(),
      sentAt: null
    };
    this.followUps.set(id, followUp);
    return followUp;
  }

  async updateFollowUp(id: number, updateData: Partial<InsertFollowUp>): Promise<FollowUp | undefined> {
    const followUp = this.followUps.get(id);
    if (!followUp) return undefined;
    
    const updated = { ...followUp, ...updateData };
    this.followUps.set(id, updated);
    return updated;
  }

  async deleteFollowUp(id: number): Promise<boolean> {
    return this.followUps.delete(id);
  }

  // Messages
  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => message.userId === userId);
  }

  async getClientMessages(clientId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => message.clientId === clientId);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage,
      subject: insertMessage.subject || null,
      followUpId: insertMessage.followUpId || null,
      responseReceived: insertMessage.responseReceived || false,
      status: insertMessage.status || "draft",
      id, 
      createdAt: new Date(),
      sentAt: null,
      responseAt: null
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: number, updateData: Partial<InsertMessage>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updated = { ...message, ...updateData };
    this.messages.set(id, updated);
    return updated;
  }

  // Dashboard stats
  async getDashboardStats(userId: number): Promise<{
    totalClients: number;
    pendingFollowUps: number;
    sentThisWeek: number;
    responseRate: number;
  }> {
    const clients = await this.getClients(userId);
    const followUps = await this.getFollowUps(userId);
    const messages = await this.getMessages(userId);

    const pendingFollowUps = followUps.filter(f => f.status === 'pending').length;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const sentThisWeek = messages.filter(m => 
      m.status === 'sent' && 
      m.sentAt && 
      m.sentAt >= weekAgo
    ).length;

    const totalSent = messages.filter(m => m.status === 'sent').length;
    const totalResponses = messages.filter(m => m.responseReceived).length;
    const responseRate = totalSent > 0 ? Math.round((totalResponses / totalSent) * 100) : 0;

    return {
      totalClients: clients.length,
      pendingFollowUps,
      sentThisWeek,
      responseRate
    };
  }
}

export const storage = new MemStorage();
