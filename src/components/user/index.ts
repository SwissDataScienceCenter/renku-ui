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

import Vue from 'vue'
import Component from 'vue-class-component'
import _ from 'lodash'
import { router } from '../../main'

export * from './profile'

export type UserState = NoUser | LoggedUser

export interface LoginState {
    logged_in: boolean
}

export class NoUser implements LoginState {
    get logged_in(): boolean { return false }
}

export class LoggedUser implements LoginState {
    get logged_in(): boolean { return true }
    get user(): any { return this._user }

    constructor(data: any) {
        this._user = data
    }

    private _user: any
}

let user_state: UserState = new NoUser
let user_state_ready: boolean = false
let user_current_fetch: null | Promise<UserState> = null

export function getUserInfo(): Promise<UserState> {
    if (user_state_ready) {
        return new Promise<UserState>((resolve, reject) => {
            resolve(user_state)
        })
    }
    else if (user_current_fetch !== null) {
        return user_current_fetch
    }
    else {
        const f = fetchUserInfo().then(state => {
            user_state = state
            user_state_ready = true
            return state
        })
        user_current_fetch = f
        return f
    }
}

function fetchUserInfo(): Promise<UserState> {
    console.log('Fetching user info')

    const headers = new Headers()
    // headers.append('pragma', 'no-cache')
    // headers.append('cache-control', 'no-cache')

    return fetch('./user_info', { headers: headers, redirect: 'error', credentials: 'include' }).then(response => {
        if (response.status === 200) {
            return response.json().then(json => {
                if (json.logged_in !== undefined) {
                    if (json.logged_in) {
                        return new LoggedUser(json.data)
                    } else {
                        return new NoUser
                    }
                } else {
                    throw new TypeError('Invalid user info')
                }
            })
        } else {
            throw new TypeError('Unexpected error while retrieving login state')
        }
    })
}

@Component({
    template: require('./user-menu.html')
})
export class UserMenuComponent extends Vue {

    raw_user: any = {}

    items: any[] = [
        { title: 'Home', icon: 'dashboard', path: '/home'},
    ]

    constructor() {
        super()
        this.updateUserInfo()
    }

    updateUserInfo(): void {
        getUserInfo().then(state => {
            this.raw_user = state
            if (state.logged_in) {
                this.items.push({ title: 'Execution contexts', icon: 'settings_applications', path: '/deploy/context' })
                this.items.push({ title: 'Storage', icon: 'folder', path: '/storage' })
                this.items.push({ title: 'Graph', icon: 'share', path: '/graph' })
                this.items.push({ title: 'Logout', icon: 'account_box', path: 'logout' })
            } else {
                this.items.push({ title: 'Login', icon: 'account_box', path: 'login' })
            }
        })
    }

    clickItem(path: string, event: Event): void {
        if (path === 'login') {
            window.location.href = '/login?redir=/'
        } else if (path === 'logout') {
            window.location.href = '/logout'
        } else {
            router.push(path)
        }
    }

}
