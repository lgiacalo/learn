module.exports = (test, h) => {
  const curry = h.curry('#cacao.pouet')
  const fromCurry = curry({ id: 'overriden' })
  const fromCurry2 = curry()
  const fromStyle = curry.style({ color: 'red' })
  const pixelized = h('div', {
    style: {
      width: 1,
      height: 0,
      opacity: 1,
    }
  })

  test.equal('h should pixelize number values that expect a unit')
    (pixelized.properties.style.width, '1px')

  test.equal('h should not pixelize number values that can be without units')
    (pixelized.properties.style.opacity, 1)

  test.equal('h should not pixelize 0')
    (pixelized.properties.style.height, 0)

  test.equal('h curry should allow to override properties')
    (fromCurry.properties.id, 'overriden')

  test.equal('h curry should keep consistent defaults properties')
    (fromCurry2.properties.id, 'cacao')
}
