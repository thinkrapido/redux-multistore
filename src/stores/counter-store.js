
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
    'isOdd': (state, payload) => {
      const out = payload % 2 === 1
      return out
    }
  }

  epics = {
    'inc': (action$) => {
      return action$
        .do(action => this.lookup('MessageStore').dispatch('set', `Value set: ${this.getState()}`))
        .map(action => { return this.tpl('isOdd', this.getState()) })
    },
    'dec': (action$) => {
      return action$
      .do(action => this.lookup('MessageStore').dispatch('set', `Value set: ${this.getState()}`))
      .map(action => { return this.tpl('isOdd', this.getState()) })
    }
  }

  constructor () {
    super()
    this.assertAll()
  }
}
