import dayjs from 'dayjs';

/**
 * 格式化日期
 */
export function formatDate(
  date: string | number | Date,
  format = 'YYYY-MM-DD HH:mm:ss'
) {
  return dayjs(date).format(format);
}
