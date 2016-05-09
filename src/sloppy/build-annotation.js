const theCook = require('component/the-cook')
const observables = require('state').observ
const moulinter = require('helper/moulinette-linter')
const reduce = require('lib/collection/reduce')
const series = require('lib/promise-series')
const count = require('lib/count')
const map = require('lib/collection/map')
const api = require('helper/github')
const is = require('lib/is')

const sauce = observables.sauce
let index = 0
const validator = bool => valid => {
  index++
  if (valid !== bool) {
    throw new Error('test #'+ index +' failed :(')
  }
}

const isTrue = validator(true)
const isFalse = validator(false)

const defaultAnnotation = {
  message: 'failed to compile your code',
  from: { line: 0, ch: 0 },
  to: { line: 1, ch: 0 },
}

const separator = '\n__inUserCode__ = false;'
const applyChainStack = reduce((q, e) => q.then(e.s, e.f))

function buildAnnotation(userCode, editorCm, editorCb, apply) {
  "use strict"
  const work = [ Promise.resolve() ]
  let __inUserCode__ = true

  function githubProxy(fn, data) {
    if (__inUserCode__) {
      throw new Error('You are not allowed to call the api directly')
    }
    const err = new Error()
    const stack = []
    work.push(() => applyChainStack(stack, fn(data))
      .catch(e => {
        console.dir(e.res)
        const { status, url } = e.res
        err.message = `Github API ${url.slice(22)}: ${status} - ${e.message}`
        throw err
      }))

    const $ = {
      then: (s, f) => (stack.push({ s, f }), $),
      catch: f => (stack.push({ f }), $),
    }

    return $
  }

  const github = map(fn => data => githubProxy(fn, data), api)

  const store = (s => ({
    get: key => {
      const value = s.get(key)
      return is.obj(value) ? Object.assign({}, value) : undefined
    },
    set: (key, value) => {
      if (__inUserCode__) {
        throw new Error('You have readonly access to the store')
      }
      s.set(key, value)
      return store
    }
  }))(new Map())

  let clear
  function getAnnotation(testCode, testCb, opts, testCm) {
    window.localStorage[sauce()] = userCode
    clear = null
    try {
      __inUserCode__ = true
      // TODO : test if the usercode contains __inUserCode__ anywhere
      eval(userCode)
      editorCb([])
    } catch (errUser) {
      editorCb(apply(moulinter(errUser, userCode, 1)))
      return testCb([])
    }

    function fail(err) {
      const annotations = moulinter(err, testCode, count(userCode, '\n') + 2)
      testCm.scrollIntoView({
        line: annotations[0].from.line,
        ch: 0,
      }, 15)
      testCb(apply(annotations))
    }

    let evalResult
    try {
      index = 0
      evalResult = eval(userCode + separator + testCode)
    } catch (errCode) {
      return fail(errCode)
    }

    theCook.animate.load.loop()
    series(work).then(() => {
      // sauce().success(evalResult)
      testCb(apply([]))
    }).catch(fail)
      .then(theCook.animate.load.stop)
  }

  const throttled = (...args) => {
    if (clear) {
      clearTimeout(clear)
      clear = setTimeout(() => getAnnotation(...args), 250)
    } else {
      getAnnotation(...args)
      clear = setTimeout(() => {}, 250)
    }
  }

  return throttled
}

module.exports = buildAnnotation
