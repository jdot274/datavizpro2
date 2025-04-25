import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Visualizations table to store user's saved visualizations
export const visualizations = pgTable("visualizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dataType: text("data_type").notNull(), // "formula", "excel", "python"
  sourceData: jsonb("source_data"), // Original source data or formula
  visualizationData: jsonb("visualization_data").notNull(), // The processed data for visualization
  shaderSettings: jsonb("shader_settings"), // Shader parameters
  cameraSettings: jsonb("camera_settings"), // Camera position and settings
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
  isPublic: boolean("is_public").default(false),
});

export const insertVisualizationSchema = createInsertSchema(visualizations).pick({
  userId: true,
  title: true,
  description: true,
  dataType: true,
  sourceData: true,
  visualizationData: true,
  shaderSettings: true,
  cameraSettings: true,
  isPublic: true,
});

export type InsertVisualization = z.infer<typeof insertVisualizationSchema>;
export type Visualization = typeof visualizations.$inferSelect;

// Python scripts table to store user's saved Python code
export const pythonScripts = pgTable("python_scripts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").notNull(),
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
  isPublic: boolean("is_public").default(false),
});

export const insertPythonScriptSchema = createInsertSchema(pythonScripts).pick({
  userId: true,
  title: true,
  description: true,
  code: true,
  isPublic: true,
});

export type InsertPythonScript = z.infer<typeof insertPythonScriptSchema>;
export type PythonScript = typeof pythonScripts.$inferSelect;

// Mathematical formulas table to store user's saved formulas
export const formulas = pgTable("formulas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  expression: text("expression").notNull(),
  variables: jsonb("variables").notNull(), // x, y range and steps
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
  isPublic: boolean("is_public").default(false),
});

export const insertFormulaSchema = createInsertSchema(formulas).pick({
  userId: true,
  title: true,
  description: true,
  expression: true,
  variables: true,
  isPublic: true,
});

export type InsertFormula = z.infer<typeof insertFormulaSchema>;
export type Formula = typeof formulas.$inferSelect;
