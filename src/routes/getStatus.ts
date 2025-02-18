import { db } from "../databases/databases";
import { Logger } from "../utils/logger";
import { Request, Response } from "express";
import os from "os";
import redis from "../utils/redis";

export async function getStatus(req: Request, res: Response): Promise<Response> {
    const startTime = Date.now();
    let value = req.params.value as string[] | string;
    value = Array.isArray(value) ? value[0] : value;
    try {
        const dbVersion = (await db.prepare("get", "SELECT key, value FROM config where key = ?", ["version"])).value;
        let statusRequests: unknown = 0;
        try {
            const numberRequests = await redis.increment("statusRequest");
            statusRequests = numberRequests?.[0];
        } catch (error) { } // eslint-disable-line no-empty

        const statusValues: Record<string, any> = {
            uptime: process.uptime(),
            commit: (global as any).HEADCOMMIT || "unknown",
            db: Number(dbVersion),
            startTime,
            processTime: Date.now() - startTime,
            loadavg: os.loadavg().slice(1), // only return 5 & 15 minute load average
            statusRequests
        };
        return value ? res.send(JSON.stringify(statusValues[value])) : res.send(statusValues);
    } catch (err) {
        Logger.error(err as string);
        return res.sendStatus(500);
    }
}
