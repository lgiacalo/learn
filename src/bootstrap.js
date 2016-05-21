const document = require('global/document')
const app = require('lib/app')
const state = require('state')
const sauce = require('data/sauce')

require('lib/eval')
require('style/spinner.css')
require('style/pure.css')

module.exports = render => {
  document.getElementById('app').remove()
  app(document.body, state, _ => render(_))

  return {
    state,
    setRender: newRender => render = newRender
  }
}
