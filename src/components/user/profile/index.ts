import Vue from 'vue'
import Component from 'vue-class-component'
import _ from 'lodash'

import { getUserInfo } from '..'

@Component({
    template: require('./profile.html')
})
export class ProfileComponent extends Vue {

    raw_user: any = {}

    created () {
        getUserInfo().then(state => {
            this.raw_user = state
           })
    }

}