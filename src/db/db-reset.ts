import mysql from "mysql2/promise";
import "dotenv/config";

async function reset() {
    const url = process.env.DATABASE_URL || "mysql://root:password@127.0.0.1:3307/smart_finance_tracker";
    let connection;

    // Try to connect up to 5 times to give Docker time to breathe
    for (let i = 1; i <= 5; i++) {
        try {
            connection = await mysql.createConnection(url);
            break; // Connected successfully! Break the loop.
        } catch (err) {
            if (i === 5) throw err;
            console.log(`Database is still booting up (Attempt ${i}/5)... Waiting 3 seconds.`);
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }

    if (!connection) return;

    console.log("Wiping database tables...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    const [rows] = await connection.query<any[]>("SHOW TABLES;");
    const tables = rows.map((row) => Object.values(row)[0]);

    for (const table of tables) {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\`;`);
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    await connection.end();
    console.log("Database wiped successfully!");
}

reset().catch(console.error);