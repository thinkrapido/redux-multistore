
import { AbstractStore } from './main-store'

export class MessageStore extends AbstractStore {
  id = 'message';

  initialValue () {
    return ''
  }

  reducers = {
    'set': (state, payload) => {
      return payload
    }
  }

  epics = {
    'set': action$ => {
      return action$
        .do(action => console.log(this.getState()))
        .mapTo(this.stop())
    }
  }

  constructor () {
    super()
    this.assertAll()
  }
}
