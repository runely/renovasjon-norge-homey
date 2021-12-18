const axios = require('axios').default
const { API: { URL, FRACTIONS, CALENDAR }, HEADER: { KEY_NAME, KEY_VALUE, COUNTY_NAME } } = require('../config')

const getData = async (url, countyId) => {
  try {
    const header = {
      headers: {}
    }
    header.headers[KEY_NAME] = KEY_VALUE
    header.headers[COUNTY_NAME] = countyId

    const { data } = await axios.get(url, header)
    return data
  } catch (error) {
    const response = { msg: '' }
    if (error.response && error.response.data && error.response.data.message) return error.response.data.message
    if (error.response && error.response.statusText) {
      response.msg = `${error.response.statusText}`
    }
    if (error.response && error.response.status) {
      if (response.msg) {
        response.msg += ` (${error.response.status})`
      } else {
        response.msg = `${error.response.status}`
      }
    }

    return response.msg || 'Feilet ved adressesøk'
  }
}

module.exports.getTrashCalendar = async (address) => {
  return await getData(`${URL}/${CALENDAR}?gatenavn=${address.streetName}&gatekode=${address.streetCode}&husnr=${address.houseNo}`, address.countyId)
}

module.exports.getTrashFractions = async countyId => {
  return await getData(`${URL}/${FRACTIONS}`, countyId)
}
