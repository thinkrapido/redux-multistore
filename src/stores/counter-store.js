
import { AbstractViewStore } from './main-store'

export class CounterStore extends AbstractViewStore {
  id = 'counter';

  initialValue () {
    return 0
  }
  initialTplConfig () {
    return {
      'odd': false
    }
  }

  reducers = {
    'inc': (state, payload) => {
      return state + 1
    },
    'dec': (state, payload) => {
      if (state < 1) {
        return state
      }
      return state - 1
    }
  }

  tplReducers = {
    'odd': (state, payload) => {
      return payload % 2 === 1
    }
  }

  epics = {
    'inc': (action$) => {
      return action$.do(action => this.lookup('MessageStore').dispatch('set', `Value set: ${this.getState()}`)).mapTo(this.stop())
    },
    'inc2': (action$) => {
      return action$.map(action => {
        return this.tpl('odd', this.getState())
      })
    },
    'dec': (action$) => {
      return action$.do(action => this.lookup('MessageStore').dispatch('set', `Value set: ${this.getState()}`)).mapTo(this.stop())
    }
  }

  constructor () {
    super()
    this.assertAll()
  }
}
