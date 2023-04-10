import { Socket } from "https://deno.land/x/socket_io@0.2.0/mod.ts";
import { alarmService } from "../services/alarmService.ts";
import { z } from "zod";

export const requestSchema = z.object({
  region: z.string()
});

export const getAlarmHandler = async (socket: Socket, request: any) => {
  try {
    const { region } = requestSchema.parse(request);
    const alarmEvent = await alarmService.findEventByRegion(region);
    socket.emit("alarm", alarmEvent);
  } catch {
    socket.emit("error", {
      message: "An error occured"
    });
  }
}