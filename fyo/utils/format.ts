import { Fyo } from 'fyo';
import { Doc } from 'fyo/model/doc';
import { DateTime } from 'luxon';
import { Field, FieldType, FieldTypeEnum } from 'schemas/types';
import { getIsNullOrUndef, safeParseFloat, titleCase } from 'utils';
import { isPesa } from '.';
import {
  DEFAULT_CURRENCY,
  DEFAULT_DATE_FORMAT,
  DEFAULT_DISPLAY_PRECISION,
  DEFAULT_LOCALE,
  DEFAULT_OUTPUT_CALENDER,
} from './consts';

export function format(
  value: unknown,
  df: string | Field | null,
  doc: Doc | null,
  fyo: Fyo
): string {
  if (!df) {
    return String(value);
  }

  const field: Field = getField(df);

  if (field.fieldtype === FieldTypeEnum.Float) {
    return Number(value).toFixed(fyo.singles.SystemSettings?.displayPrecision);
  }

  if (field.fieldtype === FieldTypeEnum.Int) {
    return Math.trunc(Number(value)).toString();
  }

  if (field.fieldtype === FieldTypeEnum.Currency) {
    return formatCurrency(value, field, doc, fyo);
  }

  if (field.fieldtype === FieldTypeEnum.Date) {
    return formatDate(value, fyo);
  }

  if (field.fieldtype === FieldTypeEnum.Datetime) {
    return formatDatetime(value, fyo);
  }

  if (field.fieldtype === FieldTypeEnum.Check) {
    return titleCase(Boolean(value).toString());
  }

  if (getIsNullOrUndef(value)) {
    return '';
  }

  return String(value);
}

function toDatetime(value: unknown): DateTime | null {
  if (typeof value === 'string') {
    return DateTime.fromISO(value);
  } else if (value instanceof Date) {
    return DateTime.fromJSDate(value);
  } else if (typeof value === 'number') {
    return DateTime.fromSeconds(value);
  }

  return null;
}

function formatDatetime(value: unknown, fyo: Fyo): string {
  if (value == null) {
    return '';
  }

  const dateFormat =
    (fyo.singles.SystemSettings?.dateFormat as string) ?? DEFAULT_DATE_FORMAT;

  const outputCalendar =
    (fyo.singles.SystemSettings?.outputCalendar as string) ?? DEFAULT_OUTPUT_CALENDER;

  const locale = (fyo.config.get('language') as string) === 'Persian' ? 'fa' : outputCalendar === 'persian' ? 'fa' : 'en-US'

  const dateTime = toDatetime(value);
  if (!dateTime) {
    return '';
  }

  let formattedDatetime = dateTime.toFormat(`${dateFormat} HH:mm:ss`, { outputCalendar: outputCalendar, locale: locale, numberingSystem: 'latn' });

  if (value === 'Invalid DateTime') {
    return '';
  }

  const persianMonth = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
  const dariMonth = ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'];

  const persianGregoryMonth = ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر']
  const dariGregoryMonth = ['جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'آگست', 'سپتمبر', 'اکتبر', 'نومبر', 'دیسمبر']
  if (outputCalendar === 'persian') {
    persianMonth.map((v, i) => { formattedDatetime = formattedDatetime.replaceAll(persianMonth[i], dariMonth[i]) })
  } else if (locale === 'fa' && outputCalendar === 'gregory') {
    persianGregoryMonth.map((v, i) => { formattedDatetime = formattedDatetime.replaceAll(persianGregoryMonth[i], dariGregoryMonth[i]) })
  }

  return formattedDatetime;
}

function formatDate(value: unknown, fyo: Fyo): string {
  if (value == null) {
    return '';
  }

  const dateFormat =
    (fyo.singles.SystemSettings?.dateFormat as string) ?? DEFAULT_DATE_FORMAT;

  const outputCalendar =
    (fyo.singles.SystemSettings?.outputCalendar as string) ?? DEFAULT_OUTPUT_CALENDER;

  const locale = (fyo.config.get('language') as string) === 'Persian' ? 'fa' : outputCalendar === 'persian' ? 'fa' : 'en-US'

  const dateTime = toDatetime(value);
  if (!dateTime) {
    return '';
  }

  let formattedDate = dateTime.toFormat(dateFormat, { outputCalendar: outputCalendar, locale: locale, numberingSystem: 'latn' });
  if (value === 'Invalid DateTime') {
    return '';
  }

  const persianMonth = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
  const dariMonth = ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'];

  const persianGregoryMonth = ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر']
  const dariGregoryMonth = ['جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'آگست', 'سپتمبر', 'اکتبر', 'نومبر', 'دیسمبر']

  if (outputCalendar === 'persian') {
    persianMonth.map((v, i) => { formattedDate = formattedDate.replaceAll(persianMonth[i], dariMonth[i]) })
  } else if (locale === 'fa' && outputCalendar === 'gregory') {
    persianGregoryMonth.map((v, i) => { formattedDate = formattedDate.replaceAll(persianGregoryMonth[i], dariGregoryMonth[i]) })
  }

  return formattedDate;
}

function formatCurrency(
  value: unknown,
  field: Field,
  doc: Doc | null,
  fyo: Fyo
): string {
  const currency = getCurrency(field, doc, fyo);

  let valueString;
  try {
    valueString = formatNumber(value, fyo);
  } catch (err) {
    (err as Error).message += ` value: '${String(
      value
    )}', type: ${typeof value}`;
    throw err;
  }

  const currencySymbol = fyo.currencySymbols[currency];
  if (currencySymbol !== undefined) {
    return currencySymbol + ' ' + valueString;
  }

  return valueString;
}

function formatNumber(value: unknown, fyo: Fyo): string {
  const numberFormatter = getNumberFormatter(fyo);
  if (typeof value === 'number') {
    value = fyo.pesa(value.toFixed(20));
  }

  if (isPesa(value)) {
    const floatValue = safeParseFloat(value.round());
    return numberFormatter.format(floatValue);
  }

  const floatValue = safeParseFloat(value as string);
  const formattedNumber = numberFormatter.format(floatValue);

  if (formattedNumber === 'NaN') {
    throw Error(
      `invalid value passed to formatNumber: '${String(
        value
      )}' of type ${typeof value}`
    );
  }

  return formattedNumber;
}

function getNumberFormatter(fyo: Fyo) {
  if (fyo.currencyFormatter) {
    return fyo.currencyFormatter;
  }

  const locale =
    (fyo.singles.SystemSettings?.locale as string) ?? DEFAULT_LOCALE;
  const display =
    (fyo.singles.SystemSettings?.displayPrecision as number) ??
    DEFAULT_DISPLAY_PRECISION;

  return (fyo.currencyFormatter = Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: display,
  }));
}

function getCurrency(field: Field, doc: Doc | null, fyo: Fyo): string {
  const defaultCurrency =
    fyo.singles.SystemSettings?.currency ?? DEFAULT_CURRENCY;

  let getCurrency = doc?.getCurrencies?.[field.fieldname];
  if (getCurrency !== undefined) {
    return getCurrency();
  }

  getCurrency = doc?.parentdoc?.getCurrencies[field.fieldname];
  if (getCurrency !== undefined) {
    return getCurrency();
  }

  return defaultCurrency;
}

function getField(df: string | Field): Field {
  if (typeof df === 'string') {
    return {
      label: '',
      fieldname: '',
      fieldtype: df as FieldType,
    } as Field;
  }

  return df;
}
