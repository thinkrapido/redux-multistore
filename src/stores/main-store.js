import _ from 'lodash'
import Rx from 'rxjs'
import { createStore, applyMiddleware } from 'redux'
import { combineEpics, createEpicMiddleware } from 'redux-observable'

export class MainStore {
  stores = {};
  store = null;

  constructor () {
    this.stores = {}
  }

  getState () {
    if (this.store === null) {
      return {}
    }
    return this.store.getState()
  }

  create (...storeClasses) {
    if (_.size(storeClasses) === 0) {
      return
    }

    let epics = []
    let defaultStore = {}

    _.each(storeClasses, (StoreClass) => {
      let obj = new StoreClass()

      _.set(this.stores, StoreClass.name, obj)
      _.set(defaultStore, obj.id, obj)

      _.each(_.get(obj, 'epics'), (epic, actionType) => {
        const fn = this.ofType(obj, epic.bind(this), actionType)
        epics = _.concat(epics, fn)
      })
    })

    const epicMiddleware = createEpicMiddleware(combineEpics.apply(combineEpics, epics))

    const store = createStore(
      this.createRootReducer(defaultStore),
      applyMiddleware(epicMiddleware)
    )

    _.each(_.values(this.stores), (obj) => { obj.store = store })
    this.store = store
  }

  ofType (obj, epic, actionType) {
    return action$ => {
      return epic(action$
        .ofType(`${obj.id}.${actionType}`)
        .map(action => {
          return {
            ...action,
            type: action.type.substring(obj.id.length + 1)
          }
        })
      )
      .map(action => {
        return {
          ...action,
          type: `${obj.id}.${action.type}`
        }
      })
    }
  }

  lookup (className) {
    const out = this.stores[className]
    if (_.isUndefined(out)) {
      throw new Error(`Class name lookup for class '${className}' failed.`)
    }
    return out
  }

  createRootReducer (defaultStore) {
    const paths = _.keys(defaultStore)
    const initialState = _.reduce(defaultStore, (result, store, id) => {
      result = _.set(result, id, store._initialValue())
      return result
    }, {})
    return (state, action) => {
      const path = _.reduce(paths, (result, path) => {
        return _.startsWith(action.type, path) ? path : result
      }, null)
      const obj = defaultStore[path]
      if (_.isUndefined(state)) {
        return initialState
      } else if (!_.isUndefined(path) && action.type === `${path}.$reset`) {
        return _.set(state, obj.id, obj._initialValue())
      } else if (path !== null) {
        return _.set(state, path, obj._reduce(action.type.substring(path.length + 1), _.get(state, path), action.payload))
      }
      return state
    }
  }
}

export class AbstractStore {
  constructor () {
    this._store$ = null
  }

  get value$ () {
    if (_.isNull(this._store$)) {
      this._store$ = Rx.Observable.create((observer) => {
        this.store.subscribe(() => {
          observer.next(_.get(this.store.getState(), this.id))
        })
      })
      .distinctUntilChanged()
      .share()
    }

    return this._store$
  }

  initialValue () {
    return undefined
  }
  _initialValue () {
    return this.initialValue()
  }

  _reduce (path, state, payload) {
    if (_.isFunction(this.reducers[path])) {
      const fn = this.reducers[path]
      return fn.bind(this)(state, payload)
    } else {
      return state
    }
  }

  getState () {
    return _.get(this.store.getState(), this.id)
  }

  reset () {
    this.dispatch('$reset')
  }

  dispatch (action, payload) {
    this.store.dispatch({ type: `${this.id}.${action}`, payload })
  }
  stop () {
    return { type: '__STOP__' }
  }

  lookup (className) {
    return mainStore.lookup(className)
  }

  assertAll () {
    this.assertNotEmptyString('id')
    this.assertDefined(this.initialValue)
    this.assertObject('reducers')
    this.assertObject('epics')

    _.each(_.keys(this.reducers), (key) => {
      this.assertFunction(`reducers.${key}`)
    })

    _.each(this.epics, (epic, i) => {
      this.assertFunction(`epics[${i}]`)
    })
  }

  assertDefined (key) {
    if (_.isFunction(key)) {
      const fn = key
      const result = fn()

      if (_.isUndefined(result)) {
        throw new Error(`result of method ${fn.name}() is undefined`)
      }
    } else if (_.isUndefined(_.get(this, key))) {
      throw new Error(`${key} is undefined`)
    }
  }
  assertString (key) {
    if (!_.isString(_.get(this, key))) {
      throw new Error(`${key} is not a string`)
    }
  }
  assertNotEmptyString (key) {
    this.assertString(key)
    if (_.get(this, key).length === 0) {
      throw new Error(`${key} is empty string`)
    }
  }
  assertObject (key) {
    if (_.isFunction(key)) {
      const fn = key
      const result = fn()

      if (!_.isObject(result)) {
        throw new Error(`result of method ${fn.name}() is not an object`)
      }
    } else if (!_.isObject(_.get(this, key))) {
      throw new Error(`${key} is not an object`)
    }
  }
  assertArray (key) {
    if (!_.isArray(_.get(this, key))) {
      throw new Error(`${key} is not an array`)
    }
  }
  assertFunction (key) {
    if (!_.isFunction(_.get(this, key))) {
      throw new Error(`${key} is not a function`)
    }
  }
}

export class AbstractViewStore extends AbstractStore {
  initialTplConfig () {
    return {}
  }
  _initialValue () {
    return {
      tplConfig: this.initialTplConfig(),
      state: this.initialValue()
    }
  }

  _reduce (path, state, payload) {
    const tplPath = path.replace(/.*__TPL__\./, '')
    if (_.includes(path, '__TPL__.') && _.isFunction(this.tplReducers[tplPath])) {
      const fn = this.tplReducers[tplPath]
      const oldState = _.get(state.tplConfig, tplPath)
      const newState = fn.bind(this)(oldState, payload)
      const out = _.set(state, `tplConfig.${tplPath}`, newState)
      return out
    } else if (_.isFunction(this.reducers[path])) {
      const newState = super._reduce(path, state.state, payload)
      return {
        ...state,
        state: newState
      }
    } else {
      return state
    }
  }

  get value$ () {
    return super.value$
      .map(value => { return value.state })
      .distinctUntilChanged()
      .share()
  }
  get config$ () {
    return super.value$
      .map(value => { return value.tplConfig })
      .distinctUntilChanged()
      .share()
  }

  dispatch (action, payload, isTplAction) {
    if (isTplAction === true) {
      action = `__TPL__.${action}`
    }
    super.dispatch(action, payload)
  }
  tpl (path, payload) {
    return {
      type: `__TPL__.${path}`,
      payload
    }
  }

  getState () {
    return super.getState().state
  }
  getTemplateConfig (path) {
    let out = super.getState().tplConfig
    if (!_.isUndefined(path)) {
      out = _.get(out, path)
    }
    return out
  }

  assertAll () {
    super.assertAll()
    this.assertObject(this.initialTplConfig)
  }
}

export let mainStore = new MainStore()

export let create = (...classNames) => { mainStore.create(...classNames) }
