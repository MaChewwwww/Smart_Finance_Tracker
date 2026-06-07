import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "mysql://root:password@127.0.0.1:3306/smart_finance_tracker";

// Create a connection pool for standard application queries
export const pool = mysql.createPool(databaseUrl);

// Create the drizzle instance
export const db = drizzle(pool, { schema, mode: "default" });
export type DbClient = typeof db;
