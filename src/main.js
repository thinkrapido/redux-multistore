// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'rxjs'
import Vue from 'vue'
import App from './App'
import router from './router'
import { create, mainStore } from './stores/main-store'
import { CounterStore } from './stores/counter-store'
import { MessageStore } from './stores/message-store'
import _ from 'lodash'

create(
  CounterStore,
  MessageStore
)

Vue.config.productionTip = false

Vue.mixin({
  beforeCreate () {
    if (_.isString(this.$options.store)) {
      this.$store = mainStore.lookup(this.$options.store)
      this.$store.value$.subscribe(value => { this.model = value; this.m = value })
      this.$store.config$.subscribe(value => { this.config = value; this.cfg = value })
    }
  },
  data () {
    if (_.isString(this.$options.store)) {
      return {
        model: this.$store.getState(),
        m: this.$store.getState(),
        config: {},
        cfg: {}
      }
    }
    return {}
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
