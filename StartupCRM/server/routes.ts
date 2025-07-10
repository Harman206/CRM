import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateMessage, optimizeMessage } from "./services/openai";
import { sendEmail, sendLinkedInMessage, validateEmailConfiguration } from "./services/email";
import { insertClientSchema, insertTemplateSchema, insertFollowUpSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = 1; // For demo, using default user
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Clients
  app.get("/api/clients", async (req, res) => {
    try {
      const userId = 1;
      const clients = await storage.getClients(userId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const userId = 1;
      const clientData = insertClientSchema.parse({ ...req.body, userId });
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid client data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create client" });
      }
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const client = await storage.updateClient(id, updates);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      if (!success) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Templates
  app.get("/api/templates", async (req, res) => {
    try {
      const userId = 1;
      const templates = await storage.getTemplates(userId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const userId = 1;
      const templateData = insertTemplateSchema.parse({ ...req.body, userId });
      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid template data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create template" });
      }
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTemplate(id);
      if (!success) {
        res.status(404).json({ error: "Template not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // Follow-ups
  app.get("/api/follow-ups", async (req, res) => {
    try {
      const userId = 1;
      const followUps = await storage.getFollowUps(userId);
      res.json(followUps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch follow-ups" });
    }
  });

  app.get("/api/follow-ups/upcoming", async (req, res) => {
    try {
      const userId = 1;
      const followUps = await storage.getUpcomingFollowUps(userId);
      
      // Enrich with client data
      const enrichedFollowUps = await Promise.all(
        followUps.map(async (followUp) => {
          const client = await storage.getClient(followUp.clientId);
          return {
            ...followUp,
            client
          };
        })
      );
      
      res.json(enrichedFollowUps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming follow-ups" });
    }
  });

  app.post("/api/follow-ups", async (req, res) => {
    try {
      const userId = 1;
      const followUpData = insertFollowUpSchema.parse({ ...req.body, userId });
      const followUp = await storage.createFollowUp(followUpData);
      res.json(followUp);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid follow-up data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create follow-up" });
      }
    }
  });

  // AI Message Generation
  app.post("/api/ai/generate-message", async (req, res) => {
    try {
      const {
        clientId,
        channel,
        messageType,
        context,
        tone
      } = req.body;

      const client = await storage.getClient(clientId);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      const generatedMessage = await generateMessage({
        clientName: client.name,
        company: client.company || undefined,
        channel,
        messageType,
        context,
        tone
      });

      res.json(generatedMessage);
    } catch (error) {
      console.error('Message generation error:', error);
      res.status(500).json({ error: "Failed to generate message: " + (error as Error).message });
    }
  });

  app.post("/api/ai/optimize-message", async (req, res) => {
    try {
      const { content, channel, tone } = req.body;
      
      const optimized = await optimizeMessage(content, channel, tone);
      res.json(optimized);
    } catch (error) {
      res.status(500).json({ error: "Failed to optimize message" });
    }
  });

  // Send Messages
  app.post("/api/messages/send", async (req, res) => {
    try {
      const {
        clientId,
        channel,
        subject,
        content,
        followUpId
      } = req.body;

      const client = await storage.getClient(clientId);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      let result;
      if (channel === "email") {
        result = await sendEmail({
          to: client.email,
          subject,
          content
        });
      } else if (channel === "linkedin") {
        if (!client.linkedinUrl) {
          res.status(400).json({ error: "Client LinkedIn URL not available" });
          return;
        }
        result = await sendLinkedInMessage(client.linkedinUrl, content);
      } else {
        res.status(400).json({ error: "Invalid channel" });
        return;
      }

      // Create message record
      const message = await storage.createMessage({
        userId: 1,
        clientId,
        followUpId: followUpId || null,
        channel,
        subject: subject || null,
        content,
        status: result.success ? "sent" : "failed"
      });

      // Update message with sent timestamp if successful
      if (result.success) {
        const updatedMessage = await storage.getMessages(1);
        const messageToUpdate = updatedMessage.find(m => m.id === message.id);
        if (messageToUpdate) {
          messageToUpdate.sentAt = new Date();
        }
      }

      // Update follow-up status if this was for a follow-up
      if (followUpId && result.success) {
        const followUps = await storage.getFollowUps(1);
        const followUpToUpdate = followUps.find(f => f.id === followUpId);
        if (followUpToUpdate) {
          followUpToUpdate.status = "sent";
          followUpToUpdate.sentAt = new Date();
        }
      }

      res.json({
        success: result.success,
        message,
        error: result.error
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Email configuration check
  app.get("/api/email/status", async (req, res) => {
    try {
      const status = await validateEmailConfiguration();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to check email status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
