'use strict';

const Homey = require('homey');
const { getTrashCalendar, getTrashFractions } = require('./lib/get-trash-data')
const repackTrash = require('./lib/repack-trash-data')

const settings = {
  address: 'address',
  getDataFailed: 'getDataFailed'
}

class MyApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MyApp has been initialized');

    this.homey.settings.on('set', args => {
      if (args && args === settings.address) {
        this.getTrashInfo()
      }
    })

    this.trash = {}

    this.getTrashInfo()
  }

  async getTrashInfo() {
    const address = this.homey.settings.get(settings.address)
    if (!address) {
      this.log('No address configured in settings yet')
      return
    }

    this.log('Trying to get trash info for:', `StreetName: '${address.streetName}'`, `StreetCode: '${address.streetCode}'`, `HouseNo: '${address.houseNo}'`, `CountyId: '${address.countyId}'`)
    const trashCalendar = await getTrashCalendar(address)
    if (typeof trashCalendar === 'string') {
      const errorMsg = this.homey.__('errors.get_data_failed').replace('%type%', 'søppelkalender').replace('%error%', trashCalendar)
      this.log(errorMsg)
      this.homey.settings.set(settings.getDataFailed, errorMsg)
      return
    } else {
      this.homey.settings.set(settings.getDataFailed, null)
    }
    this.log('Trying to get fractions for:', address.countyId)
    const trashFractions = await getTrashFractions(address.countyId)
    if (typeof trashFractions === 'string') {
      const errorMsg = this.homey.__('errors.get_data_failed').replace('%type%', 'fraksjoner').replace('%error%', trashFractions)
      this.log(errorMsg)
      this.homey.settings.set(settings.getDataFailed, errorMsg)
      return
    } else {
      this.homey.settings.set(settings.getDataFailed, null)
    }
    const repackedTrash = repackTrash(trashCalendar, trashFractions)
    this.log('Repacked:', repackedTrash)
  }
}

module.exports = MyApp;
