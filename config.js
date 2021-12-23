const Homey = require('homey')

module.exports = {
  API: {
    URL: Homey.env.API_URL || 'https://komteksky.norkart.no/komtek.renovasjonwebapi/api',
    FRACTIONS: Homey.env.API_FRACTIONS || 'fraksjoner',
    CALENDAR: Homey.env.API_CALENDAR || 'tommekalender'
  },
  HEADER: {
    KEY_NAME: Homey.env.HEADER_KEY_NAME || 'RenovasjonAppKey',
    KEY_VALUE: Homey.env.HEADER_KEY_VALUE,
    COUNTY_NAME: Homey.env.HEADER_COUNTY_NAME || 'Kommunenr'
  },
  API_GEONORGE_URL: Homey.env.API_GEONORGE_URL || 'https://ws.geonorge.no/adresser/v1/sok?sok='
}
