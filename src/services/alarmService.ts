import { db } from "../index.ts";
import { IAlarmEvent } from "../typings/alarm.ts";

export type Document<Schema> = Schema & { _id: string };

export class AlarmService {
  public async upsertEvent(event: IAlarmEvent) {
    const collection = db.collection<Document<IAlarmEvent>>("AlarmEvent");
    return await collection.updateOne({ 
      type: event.type,
      region: event.region
    }, { 
      $set: { ...event }
    }, { 
      upsert: true 
    });
  }
}

export const alarmService = new AlarmService();