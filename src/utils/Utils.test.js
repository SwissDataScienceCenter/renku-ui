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
 *  utils.test.js
 *  test fo utilities
 */

 import Time from './Time';

describe('Time class helper', () => {
  const Dates = {
    NOW: new Date(),
    UTCZ_STRING: "2019-03-11T09:34:51.000Z",
    INVALID: "this is not a date",
    ISO_READABLE_DATETIME: "2019-03-11 09:34:51",
    ISO_READABLE_DATE: "2019-03-11",
    ISO_READABLE_TIME: "09:34:51"
  } 

  it('function isDate', () => {
    expect(Time.isDate(Dates.NOW)).toBeTruthy();
    expect(Time.isDate(Dates.UTCZ_STRING)).toBeFalsy();
    expect(Time.isDate(new Date(Dates.UTCZ_STRING))).toBeTruthy();
    expect(Time.isDate(Dates.INVALID)).toBeFalsy();
  });
  it('function parseDate', () => {
    expect(Time.parseDate(Dates.NOW)).toEqual(Dates.NOW);
    expect(Time.parseDate(Dates.UTCZ_STRING)).toEqual(new Date(Dates.UTCZ_STRING));
    expect(() => { Time.parseDate(Dates.INVALID) }).toThrow("Invalid date");
  });
  it('function toISOString', () => {
    expect(Time.toISOString(Dates.UTCZ_STRING)).toEqual(Dates.ISO_READABLE_DATETIME);
    expect(Time.toISOString(Dates.UTCZ_STRING, "datetime")).toEqual(Dates.ISO_READABLE_DATETIME);
    expect(Time.toISOString(Dates.UTCZ_STRING, "date")).toEqual(Dates.ISO_READABLE_DATE);
    expect(Time.toISOString(Dates.UTCZ_STRING, "time")).toEqual(Dates.ISO_READABLE_TIME);
    const fakeType = "not existing"
    expect(() => { Time.toISOString(Dates.UTCZ_STRING, fakeType) }).toThrow(`Uknown type "${fakeType}"`);
  });
});
