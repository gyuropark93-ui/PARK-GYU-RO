import { site_visits, type InsertVisit } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  logVisit(visit: InsertVisit): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async logVisit(visit: InsertVisit): Promise<void> {
    await db.insert(site_visits).values(visit);
  }
}

export const storage = new DatabaseStorage();
