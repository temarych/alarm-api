import { NewMessage, StringSession, TelegramClient, TelegramClientParams } from "grm/mod.ts";
import { Server } from "socket.io";
import { serve } from "std/http/mod.ts";
import { load } from "std/dotenv/mod.ts";
import { LogLevel, Logger } from "grm/src/extensions/logger.ts";
import { getAlarmEvent } from "./utils/parser.ts";
import { MongoClient } from "mongo";
import { alarmService } from "./services/alarmService.ts";
import { getAlarmHandler } from "./handlers/getAlarmHandler.ts";

const env = await load({ allowEmptyValues: true });

const port = Number(env["PORT"]);
const apiId = Number(env["TELEGRAM_API_ID"]);
const apiHash = env["TELEGRAM_API_HASH"];
const session = env["SESSION"] as unknown as string | undefined;
const alarmChatId = env["ALARM_CHAT_ID"];
const databaseUrl = env["DATABASE_URL"];

const tgclientConfig: TelegramClientParams = {
  baseLogger: new Logger("warn" as LogLevel)
};

export const mongoClient = new MongoClient();

await mongoClient.connect(databaseUrl);
console.log("Connected to MongoDB");

export const io = new Server();
export const db = mongoClient.database("Database");
export const stringSession = new StringSession(session);
export const tgclient = new TelegramClient(stringSession, apiId, apiHash, tgclientConfig);

if (!session) {
  console.log("No session provided");
}

await tgclient.start({
  phoneNumber: prompt("Phone number:")!,
  password: () => prompt("Password:")!,
  phoneCode: () => prompt("Phone code:")!,
  onError: (err) => console.log(err)
});

if (!session) {
  console.log(`Session: ${tgclient.session.save()}`);
}

tgclient.addEventHandler(async event => {

  const message = event.message.text;
  const alarmEvent = getAlarmEvent(message);
  if (!alarmEvent) return;
  io.emit("alarm", alarmEvent);
  await alarmService.upsertEvent(alarmEvent);
  console.log(alarmEvent);

}, new NewMessage({
  chats: [alarmChatId]
}));

io.on("connection", socket => {
  socket.emit("Connected!");
  socket.on("alarm", getAlarmHandler);
});

serve(io.handler(), { port });