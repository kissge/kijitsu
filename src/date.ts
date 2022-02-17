/**
 * These codes are taken from the actuallly working Legalscape codebase,
 * but anyway they are written by me, too, so presumably no problems...
 **/

/**
 * Dateを「昭和48」「令和元」のような文字列に整形
 * @param date
 * @param era
 */
export function dateToWarekiYear(date: Date, era: 'short' | 'narrow' = 'short') {
  // FIXME: no IE support
  const dateString = date.toLocaleDateString('ja-JP-u-ca-japanese', { era, year: 'numeric' });
  const numericMatch = dateString.match(/(\D+)(\d+)年/);

  if (numericMatch == null) {
    const firstYearMatch = dateString.match(/(\D+)元年$/);
    const [_, e] = firstYearMatch ? firstYearMatch : [];
    return `（${e}元）`;
  }

  const [_, e, y] = numericMatch;
  return '（' + e + y + '）';
}

/**
 * DateあるいはDateに変換できる文字列を「1992（平成4）年9月28日」のような文字列に整形
 * @param date
 */
export function formatYmd(date: Date | string | null) {
  if (!date) {
    return '';
  }

  if (typeof date === 'string') {
    date = new Date(date);
  }

  const y = date.getFullYear(),
    m = date.getMonth() + 1,
    d = date.getDate(),
    w = dateToWarekiYear(date);

  return `${y}${w}年${m}月${d}日`;
}

export function formatDayOfWeek(date: Date) {
  return date.toLocaleDateString('ja-JP-u-ca-japanese', { weekday: 'short' });
}

export function formatISO(date: Date) {
  const y = date.getFullYear(),
    m = date.getMonth() + 1,
    d = date.getDate();

  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
