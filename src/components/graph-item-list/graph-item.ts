import _ from 'lodash'

export class GraphItem {

    id: null | number = null
    name: string
    description: string
    readonly properties: Property[] = []

    constructor(json: object, nameKey: string, descriptionKey: string) {
        if (!json===undefined) {
            this.id = json['id']
            let that = this
            _.forEach(json['properties'], function(p) {
                if (p.key === nameKey) {
                    that.name = p.values[0]['value']
                }
                else if (p.key === descriptionKey) {
                    that.description = p.values[0]['value']
                }
                else {
                    that.properties.push({'key': p.key, 'value': p.values[0]['value']})
                }
            })
        }
    }
}

export interface Property {
    key: string,
    value: any
}
