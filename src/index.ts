import { NewMessage, StringSession, TelegramClient } from "grm/mod.ts";
import { Server } from "socket.io";
import { serve } from "std/http/mod.ts";
import { load } from "std/dotenv/mod.ts";
import { LogLevel, Logger } from "grm/src/extensions/logger.ts";
import { parseAlarmEvent } from "./utils/parser.ts";

const env = await load({ allowEmptyValues: true });

const port = Number(env["PORT"]);
const apiId = Number(env["TELEGRAM_API_ID"]);
const apiHash = env["TELEGRAM_API_HASH"];
const session = env["SESSION"] as unknown as string | undefined;
const alarmChatId = env["ALARM_CHAT_ID"];

const io = new Server();

const stringSession = new StringSession(session);
const tgclient = new TelegramClient(stringSession, apiId, apiHash, { 
  baseLogger: new Logger("warn" as LogLevel) 
});

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

tgclient.addEventHandler(event => {

  const message = event.message.text;
  const alarmEvent = parseAlarmEvent(message);
  io.emit("alarm", alarmEvent);
  console.log(alarmEvent);

}, new NewMessage({
  chats: [alarmChatId]
}));

io.on("connection", socket => {
  socket.emit("Welcome!");
});

serve(io.handler(), { port });