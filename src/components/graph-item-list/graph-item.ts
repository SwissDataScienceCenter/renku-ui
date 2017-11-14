/*
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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

export class GraphItem {

    id: null | number = null
    name: string
    labels: string [] = []
    description: string
    properties: Property[] = []

    constructor(json: object, nameKey: string, labelKey: string, descriptionKey: string) {
        if (json !== undefined) {
            this.id = json['id']
            let that = this
            json['properties'].forEach(function(p) {
                if (p.key === nameKey) {
                    that.name = p.values[0]['value']
                }
                else if (p.key === descriptionKey) {
                    that.description = p.values[0]['value']
                }
                else if (p.key !== labelKey) {
                    that.properties.push({'key': p.key, 'value': p.values[0]['value']})
                }

                if (p.key === labelKey) {
                    that.labels = p.values.map( value => value.value )
                    that.properties.push({'key': p.key, 'value': p.values.map( el => el['value']).join(', ')})
                }
            })
        }
    }
}

export interface Property {
    key: string,
    value: any
}
