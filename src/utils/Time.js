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

// TODO: expand this with {timeFormat} from 'd3' to properly handle human readable dates according to localization

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

    else if (type === "date")
      return readableDate.substring(0, 10);

    else if (type === "time")
      return readableDate.substring(11);


      throw (new Error(`Uknown type "${type}"`));

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

}

export default Time;
export { Time };
