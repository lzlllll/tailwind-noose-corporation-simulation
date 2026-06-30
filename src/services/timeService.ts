export interface ScheduleEvent {
  id: string;
  name: string;
  type: 'market-open' | 'market-close' | 'meeting' | 'deadline' | 'custom';
  city: string;
  timezone: number;
  startTime: string;
  endTime?: string;
  description?: string;
  recurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
}

export interface CityTimezone {
  city: string;
  timezone: number;
  displayName: string;
}

export const cityTimezones: CityTimezone[] = [
  { city: '北京', timezone: 8, displayName: '东八区 (UTC+8)' },
  { city: '上海', timezone: 8, displayName: '东八区 (UTC+8)' },
  { city: '深圳', timezone: 8, displayName: '东八区 (UTC+8)' },
  { city: '香港', timezone: 8, displayName: '东八区 (UTC+8)' },
  { city: '东京', timezone: 9, displayName: '东九区 (UTC+9)' },
  { city: '新加坡', timezone: 8, displayName: '东八区 (UTC+8)' },
  { city: '纽约', timezone: -5, displayName: '西五区 (UTC-5)' },
  { city: '伦敦', timezone: 0, displayName: '格林威治 (UTC+0)' },
  { city: '法兰克福', timezone: 1, displayName: '东一区 (UTC+1)' },
  { city: '悉尼', timezone: 11, displayName: '东十一区 (UTC+11)' },
];

export const defaultScheduleEvents: ScheduleEvent[] = [
  { id: 'sse-open', name: '上交所开盘', type: 'market-open', city: '上海', timezone: 8, startTime: '09:30', endTime: '11:30', recurring: true, recurringPattern: 'daily' },
  { id: 'sse-close', name: '上交所收盘', type: 'market-close', city: '上海', timezone: 8, startTime: '13:00', endTime: '15:00', recurring: true, recurringPattern: 'daily' },
  { id: 'hke-open', name: '港交所开盘', type: 'market-open', city: '香港', timezone: 8, startTime: '09:30', endTime: '12:00', recurring: true, recurringPattern: 'daily' },
  { id: 'hke-close', name: '港交所收盘', type: 'market-close', city: '香港', timezone: 8, startTime: '13:00', endTime: '16:00', recurring: true, recurringPattern: 'daily' },
  { id: 'nyse-open', name: '纽交所开盘', type: 'market-open', city: '纽约', timezone: -5, startTime: '09:30', endTime: '16:00', recurring: true, recurringPattern: 'daily' },
  { id: 'lse-open', name: '伦敦交易所开盘', type: 'market-open', city: '伦敦', timezone: 0, startTime: '08:00', endTime: '16:30', recurring: true, recurringPattern: 'daily' },
];

export function convertTimeToTimezone(gameTime: string, targetTimezone: number, baseTimezone: number = 8): string {
  const date = new Date(gameTime);
  const offsetDiff = targetTimezone - baseTimezone;
  const newDate = new Date(date.getTime() + offsetDiff * 60 * 60 * 1000);
  return newDate.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function getCurrentTimeInCity(gameTime: string, city: string): string {
  const cityInfo = cityTimezones.find(c => c.city === city);
  if (!cityInfo) {
    return gameTime;
  }
  return convertTimeToTimezone(gameTime, cityInfo.timezone);
}

export function checkScheduleEvents(gameTime: string): ScheduleEvent[] {
  const triggeredEvents: ScheduleEvent[] = [];
  const date = new Date(gameTime);
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  const dayOfWeek = date.getDay();

  for (const event of defaultScheduleEvents) {
    if (event.recurring) {
      if (event.recurringPattern === 'daily') {
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          if (currentTimeStr >= event.startTime && (!event.endTime || currentTimeStr <= event.endTime)) {
            triggeredEvents.push(event);
          }
        }
      }
    }
  }

  return triggeredEvents;
}

export function isWorkingHours(gameTime: string, city: string): boolean {
  const cityTime = getCurrentTimeInCity(gameTime, city);
  const date = new Date(cityTime);
  const hour = date.getHours();
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  return hour >= 9 && hour < 18;
}

export function formatGameTimeWithTimezone(gameTime: string, baseTimezone: number = 8): string {
  const date = new Date(gameTime);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    hour12: false,
  }) + ` (UTC+${baseTimezone})`;
}