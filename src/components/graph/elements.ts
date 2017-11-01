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

import * as d3 from 'd3';

export interface PersistedVertex {
    id: number,
    types: string[],
    properties: any[]
}

export interface DisplayVertex extends d3.SimulationNodeDatum {
    id: string,
    label: string,
    display_name: string,
    detailUrl: string,
    self: PersistedVertex,
    startingLinks?: DisplayEdge[],
    endingLinks?: DisplayEdge[],
    aggregated?: boolean,
    mergedTo?: DisplayEdge,
    collapsible: boolean
    dialogs: Dialog[]
}

export interface Dialog {
    name: string,
    dialogType: string
}

export interface PersistedEdge {
    id: string,
    label: string,
    from: number,
    to: number,
    properties: Property[]
}

export interface DisplayEdge extends d3.SimulationLinkDatum<DisplayVertex> {
    id: string,
    label: string,
    // d3 replaces source and target ids with the actual objects.
    source: string | DisplayVertex,
    target: string | DisplayVertex,
    display_name: string,
    self: PersistedEdge
}

export interface Property {
    key: string,
    value: any
}

export interface ScreenTransform {
    x: number,
    y: number,
    k: number
}

export interface Coordinates {
    x?: number,
    y?: number
}

export interface LinkCoordinates {
    start: Coordinates,
    end: Coordinates
}