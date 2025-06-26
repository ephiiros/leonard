import PocketBase from "pocketbase";
import { logger } from "../../libs/common";
import { config } from "../../config";

let authpb: PocketBase | null = null;

export async function getSuperuser() {
  if (authpb === null) {
    logger.info("doing auth first time");
    const pb = new PocketBase(config.DB_IP);
    await pb
      .collection("_superusers")
      .authWithPassword(config.DB_USER, config.DB_PASSWORD);
    pb.autoCancellation(false);
    authpb = pb;
  }
  logger.info(authpb.authStore.isValid)
  if (authpb.authStore.isValid === false) {
    logger.info("updating auth")
    await authpb
      .collection("_superusers")
      .authWithPassword(config.DB_USER, config.DB_PASSWORD);

    logger.info("updated auth " + authpb.authStore.isValid)
  } 
  return authpb;
}