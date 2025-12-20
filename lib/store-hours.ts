/**
 * Store Hours Utility
 * Handles store open/close status based on Stockholm timezone
 */

export interface StoreHours {
  day: string;
  open: string;
  close: string;
}

export interface StoreStatus {
  isOpen: boolean;
  currentDay: string;
  todayHours: string;
  statusText: string;
  nextChange?: string;
}

// Store hours configuration
const STORE_HOURS: Record<string, StoreHours> = {
  monday: { day: 'Monday', open: '10:00', close: '20:00' },
  tuesday: { day: 'Tuesday', open: '10:00', close: '20:00' },
  wednesday: { day: 'Wednesday', open: '10:00', close: '20:00' },
  thursday: { day: 'Thursday', open: '10:00', close: '20:00' },
  friday: { day: 'Friday', open: '10:00', close: '20:00' },
  saturday: { day: 'Saturday', open: '11:00', close: '19:00' },
  sunday: { day: 'Sunday', open: '11:00', close: '19:00' },
};

/**
 * Get current date/time in Stockholm timezone
 */
function getStockholmTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Stockholm' }));
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if store is currently open
 */
export function getStoreStatus(): StoreStatus {
  const now = getStockholmTime();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todaySchedule = STORE_HOURS[currentDay];
  const openMinutes = timeToMinutes(todaySchedule.open);
  const closeMinutes = timeToMinutes(todaySchedule.close);

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  // Format today's hours
  let todayHours: string;
  const isWeekend = currentDay === 'saturday' || currentDay === 'sunday';

  if (isWeekend) {
    todayHours = `Sat-Sun: ${todaySchedule.open}–${todaySchedule.close}`;
  } else {
    todayHours = `Mon-Fri: ${todaySchedule.open}–${todaySchedule.close}`;
  }

  // Status text
  const statusText = isOpen ? 'Open Now' : 'Closed';

  // Calculate next change time (when it opens or closes)
  let nextChange: string | undefined;
  if (isOpen) {
    nextChange = `Closes at ${todaySchedule.close}`;
  } else if (currentMinutes < openMinutes) {
    nextChange = `Opens at ${todaySchedule.open}`;
  } else {
    // Store is closed for today, show tomorrow's opening
    const tomorrowDay = dayNames[(now.getDay() + 1) % 7];
    const tomorrowSchedule = STORE_HOURS[tomorrowDay];
    nextChange = `Opens tomorrow at ${tomorrowSchedule.open}`;
  }

  return {
    isOpen,
    currentDay: todaySchedule.day,
    todayHours,
    statusText,
    nextChange,
  };
}

/**
 * Get formatted store hours for display
 */
export function getFormattedStoreHours(): {
  weekday: string;
  weekend: string;
  full: string;
} {
  return {
    weekday: 'Mon-Fri: 10:00–20:00',
    weekend: 'Sat-Sun: 11:00–19:00',
    full: 'Mon-Fri: 10:00–20:00 • Sat-Sun: 11:00–19:00',
  };
}
