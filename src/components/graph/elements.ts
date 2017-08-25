export interface PersistedVertex {
    id: number,
    types: string[],
    properties: any[]
}

export interface PersistedEdge {
    id: string,
    label: string,
    from: number,
    to: number,
    properties: Property[]
}

export interface Property {
    key: string,
    value: any
}
