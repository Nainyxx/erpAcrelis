/**
 * Утилиты форматирования значений для отображения и для отправки в API.
 * Перенесены из api.js: единое место правки форматов дат и цен.
 */

/** YYYY-MM-DD / ISO / 'DD.MM.YYYY' → 'DD.MM.YYYY' для отображения. */
export function formatDateForDisplay(dateString) {
  if (!dateString) return '';

  if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    return dateString;
  }

  if (dateString.includes('T')) {
    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}.${month}.${year}`;
    } catch {
      return dateString;
    }
  }

  return dateString;
}

/** ISO datetime → 'DD.MM.YYYY HH:mm'. */
export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  try {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch {
    return '';
  }
}

/**
 * Привести произвольный ввод даты к 'YYYY-MM-DD' для отправки в API.
 * Поддерживает ISO с временем, 'DD.MM.YYYY' и 'YYYY-MM-DD'.
 */
export function formatDateForApi(input) {
  if (!input) return '';
  let value = String(input);

  if (value.includes('T')) {
    return value.split('T')[0];
  }

  if (value.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    const [day, month, year] = value.split('.');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return value;
}

/** Совместимый алиас старой публичной функции. */
export function convertToAPIDate(dateString) {
  if (!dateString) return null;

  if (dateString.includes('T') && dateString.includes('+')) {
    return dateString;
  }

  return formatDateForApi(dateString);
}

/** Привести цену к строке с двумя знаками после запятой ('0.00'). */
export function cleanPriceForAPI(price) {
  if (typeof price === 'number') return price.toFixed(2);
  const clean = price.toString()
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}
