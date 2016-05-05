const ws = require('lib/ws')
const each = require('lib/collection/each')
const find = require('lib/find')
const test00 = require('sauce/0000-variables.test')
const xmpl00 = require('sauce/0000-variables.xmpl')
const observables = require('state').observ;
const cookProps = require('state').observ.cookProps
const inRange = require('lib/arr').inRange

// require([
//   "sauce/00.test",
// ], observables.codeMirror.set);

let currentIdx = 0

const set = () => observables.sauce.set(saucelist[currentIdx])

const load = idx => {
  const newIdx = inRange(saucelist, idx)
  if (newIdx === currentIdx) return
  currentIdx = idx
  set()
}

load.next = () => load(idx + 1)
load.prev = () => load(idx - 1)
load.sauce = sauce =>
  load((find(saucelist, s => s.sauce === sauce) || saucelist[0]).idx)

const theCookSay = (eye, message, delay) =>
  setTimeout(() => cookProps.set({ eye, message }), delay || 0)

const saucelist = [
  {
    sauce: '00',
    test: test00,
    example: xmpl00,
    watch: 'ZxQf_WXF0nc',
    postData: "user",
    success: user => {
      ws.send.data(user)
      theCookSay('^', 'Well done '+ user.name)
      theCookSay('o', 'I will remember you', 4000)
      theCookSay('o', 'Comme back later for more tests', 8000)
      theCookSay('T', 'I\'m sad now', 16000)
      document.getElementById('moulinette').classList.add('loading')
    }
  },
]

each((s, i) => s.idx = i, saucelist)

set()

module.exports = { load, list: saucelist }
