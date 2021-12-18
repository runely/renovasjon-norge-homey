const Homey = require('homey')

module.exports = {
  API: {
    URL: Homey.env.API_URL,
    FRACTIONS: Homey.env.API_FRACTIONS,
    CALENDAR: Homey.env.API_CALENDAR
  },
  HEADER: {
    KEY_NAME: Homey.env.HEADER_KEY_NAME,
    KEY_VALUE: Homey.env.HEADER_KEY_VALUE,
    COUNTY_NAME: Homey.env.HEADER_COUNTY_NAME
  },
  API_GEONORGE_URL: Homey.env.API_GEONORGE_URL
}
