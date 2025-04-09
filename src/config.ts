import dotenv from "dotenv";

dotenv.config();

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DB_USER,
  DB_PASSWORD,
  DB_IP,
  VOTE_OFFSET,
} = process.env;

if (
  !DISCORD_TOKEN ||
  !DISCORD_CLIENT_ID ||
  !DB_USER ||
  !DB_PASSWORD ||
  !DB_IP || 
  !VOTE_OFFSET
) {
  throw new Error("Missing environment variables");
}

export const config = {
  DB_IP,
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DB_USER,
  DB_PASSWORD,
  VOTE_OFFSET
};
