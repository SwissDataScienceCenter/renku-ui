/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *  renku-ui
 *
 *  Time.js
 *  Helper functions to handle date and time
 */

import * as d3TimeFormat from "d3-time-format";


class Time {
  static isDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  static parseDate(date) {
    if (this.isDate(date))
      return date;

    const convertedDate = new Date(date);
    if (this.isDate(convertedDate))
      return convertedDate;

    throw (new Error("Invalid date"));
  }

  static toIsoString(inputDate, type = "datetime") {
    const date = this.parseDate(inputDate);
    const readableDate = date.toISOString().substring(0, 19).replace("T", " ");
    if (type === "datetime")
      return readableDate;
    else if (type === "datetime-short")
      return readableDate.substring(0, 16);
    else if (type === "date")
      return readableDate.substring(0, 10);
    else if (type === "time")
      return readableDate.substring(11);

    throw (new Error(`Unknown type "${type}"`));
  }

  static toIsoTimezoneString(inputDate, type = "datetime") {
    // add the timezone manually and then convert to ISO string
    const date = this.parseDate(inputDate);
    const isoDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    return this.toIsoString(isoDate, type);
  }

  static getReadableDate(inputDate) {
    const date = this.parseDate(inputDate);
    let months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  }

  static isSameDay(inputDate1, inputDate2, locale = true) {
    const date1 = this.parseDate(inputDate1);
    const date2 = this.parseDate(inputDate2);

    if (locale) {
      return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
    }
    return date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate();
  }

  /**
   * Format a date/time string using either toLocale[Date,Time]String (default) or d3 format string.
   *
   * formatString should be a d3TimeFormat format string:
   * @param {string} dt The date to format
   * @param {object} options {localeTimeOptions: object, d3FormatString: string or null}.
   *   The localeTimeOptions are passed to toLocaleTimeString. Defaults to
   *     { hour: "2-digit", minute: "2-digit" }.
   *   The d3FormatString should be of the form https://github.com/d3/d3-time-format.
   *   If the d3FormatString is not null, it is used, otherwise, the locale formatting is used
   */
  static formatDateTime(dt,
    { localeTimeOptions, d3FormatString } =
    { localeTimeOptions: { hour: "2-digit", minute: "2-digit" }, d3FormatString: null } ) {
    if (d3FormatString !== null)
      return d3TimeFormat.timeFormat(d3FormatString)(dt);
    return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], localeTimeOptions)}`;
  }

  /**
   * Convert a duration into text. Up to 24 hours and approximate.
   * @param {number} seconds - number of seconds
   * @returns stringy approximate duration.
   */
  static getDuration(seconds) {
    let currentValue = parseInt(seconds);
    if (currentValue < 1)
      return "Less than 1 second";
    if (currentValue === 1)
      return "1 second";
    if (currentValue < 60)
      return `${currentValue} seconds`;
    currentValue = currentValue / 60;
    if (currentValue >= 1 && currentValue < 2)
      return "1 minute";
    if (currentValue >= 2 && currentValue < 60)
      return `${parseInt(currentValue)} minutes`;
    currentValue = currentValue / 60;
    if (currentValue >= 1 && currentValue < 2)
      return "1 hour";
    if (currentValue >= 2 && currentValue <= 24)
      return `${parseInt(currentValue)} hours`;
    return "more than 24 hours";
  }
}

export default Time;
export { Time };
