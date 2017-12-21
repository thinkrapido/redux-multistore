// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'rxjs'
import Vue from 'vue'
import App from './App'
import router from './router'
import MainStore from './stores/main-store'
import { CounterStore } from './stores/counter-store'
import { MessageStore } from './stores/message-store'
import _ from 'lodash'

Vue.config.productionTip = false

MainStore.createStore(
  CounterStore,
  MessageStore
)

const store = MainStore.store
const counterStore = MainStore.lookup('CounterStore')

console.log(_.cloneDeep(store.getState()))

counterStore.act('inc')

console.log(_.cloneDeep(store.getState()))

counterStore.act('inc')

console.log(_.cloneDeep(store.getState()))

counterStore.act('inc')

console.log(_.cloneDeep(store.getState()))

MainStore.lookup('MessageStore').reset()

console.log(_.cloneDeep(store.getState()))

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
