export type IAlarmType = "air-alarm" | "artillery-shelling-alarm";
export type IAlarmStatus = "on" | "off";

export interface IAlarm {
  type: IAlarmType;
  status: IAlarmStatus;
  token: string;
}

export const alarms = [
  {
    type: "air-alarm",
    status: "on",
    token: "Повітряна тривога"
  },
  {
    type: "air-alarm",
    status: "off",
    token: "Відбій тривоги"
  },
  {
    type: "artillery-shelling-alarm",
    status: "on",
    token: "Загроза артобстрілу"
  },
  {
    type: "artillery-shelling-alarm",
    status: "off",
    token: "Відбій загрози артобстрілу"
  }
] as const satisfies readonly IAlarm[];

export type IAlarmToken = (typeof alarms)[number]["token"];

export interface IAlarmEvent {
  type: IAlarmType;
  status: IAlarmStatus;
  date: Date;
  region: string;
  message: string;
}