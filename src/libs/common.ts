import { config } from "../config";
import PocketBase from "pocketbase";
import pino from 'pino';
export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

export let authpb: PocketBase | null = null

export async function doAuth() {
    if (authpb === null) {
        logger.info("doing auth first time")
        const pb = new PocketBase(config.DB_IP);
        await pb.collection("_superusers")
            .authWithPassword(config.DB_USER, config.DB_PASSWORD)
        pb.autoCancellation(false);
        authpb = pb
    }
    return authpb
}

export const activeTimers: NodeJS.Timeout[] = [];

export function getShortMatchId(MatchId: string) {
  return MatchId.replaceAll(" Season", "").replaceAll("Season_", "")
}