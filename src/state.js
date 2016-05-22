const buildState = require('lib/state')
const observ = require('lib/emiter/observ')
const event = require('lib/event')
const assignDeep = require('lib/assign-deep')
const window = require('global/window')
const hash = require('lib/hash')
const defaults = require('data/defaults')
const local = window.localStorage
const config = observ({})
const progress = observ('')

config.update = newConf => {
  config.set(assignDeep(config(), newConf))
  if (newConf && newConf.login) {
    const { login, srcRepo } = config()
    editorMode.set(srcRepo.split('/')[0] === login)
  }
}

const exercise = observ.check(local.exercise)

observ.immediate(exercise, ex => {
  local.exercise = ex
  progress.set(local[ex])
})

const setUrlDefault = (user, repo, branch, ex) => hash.set(
  `${ user || defaults.user
  }/${ repo || defaults.repo
  }/${ branch || defaults.branch }/${ex}/`)

observ.immediate(hash, () => {
  const [ user, repo, branch, ex ] = hash.parts()
  const prevEx = exercise()
  if (!ex) {
    if (prevEx) return setUrlDefault(user, repo, branch, prevEx)
  } else if (prevEx !== ex) {
    if (prevEx) return setUrlDefault(user, repo, branch, prevEx)
    exercise.set(ex)
  }

  config.update({
    branch: branch || defaults.branch,
    srcRepo: (user || defaults.user) +'/'+ (repo || defaults.repo),
  })
})

const getEditorModeInitValue = () => {
  if (!local.__ID__) return false
  const user = atob(local.__ID__).split(':')[0]
  return hash.parts()[0] === user
}

const editorMode = observ.check(getEditorModeInitValue())
const test = observ('')
observ.format(test, val => {
  if (!editorMode()) return val
  const key = `__TEST__${exercise()}__`
  if (local[key]) return local[key]
  return local[key] = val
})

const state = {
  test,
  config,
  exercise,
  progress,
  editorMode,
  tests: observ({}),
  split: observ.check(0.5),
  exemples: observ({}),
  cookProps: observ({ eye: '-', message: 'Loading .....' }),
  codeMirror: observ(null),
  _hotVersion: observ(0),
  viewHeight: event.viewHeight,
  viewWidth: event.viewWidth,
  lbtn: event.lbtn,
}

window.__state__ = state

const globalState = {
  observ: buildState(state),
  afterEachRender: (cache => {
    const preInit = fn => cache.push(fn)
    preInit.init = fn => {
      cache.forEach(fn);
      globalState.afterEachRender = fn
    }
    return preInit
  })([]),
  afterNextRender: fn =>
    globalState.afterEachRender((_, remove) => remove(fn(_)))
}

module.exports = globalState;
