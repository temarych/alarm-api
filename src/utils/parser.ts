import { IAlarm, IAlarmEvent, IAlarmToken, alarms } from "../typings/alarm.ts";
import { parse as parseDate } from "std/datetime/mod.ts";

export const parseAlarm = (message: string): IAlarm => {
  const tokens = alarms.map(alarm => alarm.token);
  const tokenRegExp = new RegExp(tokens.join("|"));
  const tokenMatches = message.match(tokenRegExp) || [];
  const token = tokenMatches[0] as IAlarmToken;
  return alarms.find(alarm => alarm.token === token) as IAlarm;
}

export const parseRegion = (message: string): string => {
  const tokens = alarms.map(alarm => `${alarm.token} в `);
  const regionRegExp = new RegExp(`(?<=${tokens.join("|")})[^.\n*]*`);
  const regionMatches = message.match(regionRegExp) || [];
  return regionMatches[0] as string;
}

export const parseTime = (message: string): string => {
  const timeRegExp = /\d\d:\d\d/g;
  const timeMatches = message.match(timeRegExp) || [];
  return timeMatches[0] as string;
}

export const parseAlarmEvent = (message: string): IAlarmEvent => {
  const { type, status, token } = parseAlarm(message);
  const region = parseRegion(message);
  const time = parseTime(message);
  const date = parseDate(time, "HH:mm");
  return { type, status, region, date, message: token };
}