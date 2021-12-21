const getFraction = (data, id) => data.find(item => item.Id === id)

module.exports = (data, fractions) => {
  return data.reduce((acc, curr) => {
    const fraction = getFraction(fractions, curr.FraksjonId)
    const item = {
      Navn: fraction ? fraction.Navn : '',
      Ikon: fraction ? fraction.Ikon : '',
      ...curr
    }

    curr.Tommedatoer.forEach(date => {
      if (Array.isArray(acc[date])) {
        acc[date].push(item)
      } else {
        acc[date] = [item]
      }
    })
    return acc
  }, {})
}
