// src/utils/date.utils.ts
export class DateUtils {
  static parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
    }
    return date;
  }

  static getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  static getEndOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  static getDateRange(date?: string, range?: 'day' | 'week' | 'month') {
    const targetDate = date ? this.parseDate(date) : new Date();
    
    let startDate: Date;
    let endDate: Date;

    if (range === 'week') {
      startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - 7);
      endDate = this.getEndOfDay(targetDate);
    } else if (range === 'month') {
      startDate = new Date(targetDate);
      startDate.setMonth(startDate.getMonth() - 1);
      endDate = this.getEndOfDay(targetDate);
    } else {
      // Default to single day
      startDate = this.getStartOfDay(targetDate);
      endDate = this.getEndOfDay(targetDate);
    }

    return { startDate, endDate };
  }
}