const getFraction = (data, id) => data.find(item => item.Id === id)

module.exports = (data, fractions) => {
  return data.map(item => {
    const fraction = getFraction(fractions, item.FraksjonId)
    return {
      Navn: fraction ? fraction.Navn : '',
      Ikon: fraction ? fraction.Ikon : '',
      ...item
    }
  })
}
