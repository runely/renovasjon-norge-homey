'use strict';

const Homey = require('homey');
const moment = require('moment-timezone')
const { getTrashCalendar, getTrashFractions } = require('./lib/get-trash-data')
const repackTrash = require('./lib/repack-trash-data')

const appSettings = {
  address: 'address',
  getDataFailed: 'getDataFailed',
  timezone: 'Europe/Oslo',
  timeoutMaxValue: 2147483647
}

class MyApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('onInit -- MyApp has been initialized');

    this.homey.settings.on('set', args => {
      if (args && args === appSettings.address) {
        this.getTrashInfo()
      }
    })

    this.homey.flow.getTriggerCard('trash_today')
      .registerRunListener((args, state) => {
        this.log('runListener -- trash_today triggered!')
      })
      /* .on('update', async () => {
        const args = await this.homey.flow.getTriggerCard('trash_today').getArgumentValues()
        const arg = args[0]
        this.log('onUpdate -- trash_today#onUpdate', 'Args:', arg, '--', Object.getOwnPropertyNames(arg))
      }) */

    this.trashInfo = {}
    this.triggerInfo = [
      {
        name: 'next_refresh',
        id: null
      },
      {
        name: 'trash_today',
        handlers: []
      }
    ]

    this.setNextTrashInfoRefresh()
    this.getTrashInfo()
  }

  async getTrashInfo() {
    const address = this.homey.settings.get(appSettings.address)
    if (!address) {
      this.log('getTrashInfo --', 'No address configured in settings yet')
      return
    }

    this.log('getTrashInfo --', 'Getting trash info for:', `StreetName: '${address.streetName}'`, `StreetCode: '${address.streetCode}'`, `HouseNo: '${address.houseNo}'`, `CountyId: '${address.countyId}'`)
    const trashCalendar = await getTrashCalendar(address)
    if (typeof trashCalendar === 'string') {
      const errorMsg = this.homey.__('errors.get_data_failed').replace('%type%', 'søppelkalender').replace('%error%', trashCalendar)
      this.log('getTrashInfo --', errorMsg)
      this.homey.settings.set(appSettings.getDataFailed, errorMsg)
      return
    } else {
      this.homey.settings.set(appSettings.getDataFailed, null)
    }

    this.log('getTrashInfo --', 'Getting fractions for:', address.countyId)
    const trashFractions = await getTrashFractions(address.countyId)
    if (typeof trashFractions === 'string') {
      const errorMsg = this.homey.__('errors.get_data_failed').replace('%type%', 'fraksjoner').replace('%error%', trashFractions)
      this.log('getTrashInfo --', errorMsg)
      this.homey.settings.set(appSettings.getDataFailed, errorMsg)
      return
    } else {
      this.homey.settings.set(appSettings.getDataFailed, null)
    }

    this.trashInfo = repackTrash(trashCalendar, trashFractions)

    this.setTrashInfoTriggers()
  }

  async setTrashInfoTriggers() {
    this.clearTrashInfoTriggers()

    // trigger for today
    const trashInfoTrigger = this.triggerInfo.find(trigger => trigger.name === 'trash_today')

    const now = this.getMoment()
    const dates = Object.getOwnPropertyNames(this.trashInfo)
    dates.forEach(date => {
      const trash = this.trashInfo[date]
      const trashTypes = trash.reduce((acc, curr, index) => {
        if (acc === '') { acc = `'${curr.Navn}'` }
        else { acc += `${(index + 1) === trash.length ? ' og' : ','} '${curr.Navn}'` }
        return acc
      }, '')

      const trashDate = this.getMoment(date)
      const then = trashDate - now
      if (trashDate < now) {
        this.log('setTrashInfoTriggers --', `Trigger point past for trash_today - ${trashTypes} - ${this.getDateTimeString(trashDate)}`)
        return
      } else if (then > appSettings.timeoutMaxValue) {
        this.log('setTrashInfoTriggers --', `Skipping trigger for trash_today - ${trashTypes} - ${this.getDateTimeString(trashDate)} - Too far into the future`)
        return
      }

      this.log('setTrashInfoTriggers --', `Adding trigger for trash_today - ${trashTypes} - ${this.getDateTimeString(trashDate)}`)
      trashInfoTrigger.handlers.push({
        name: trashTypes,
        id: this.homey.setTimeout(() => {
          this.homey.flow.getTriggerCard('trash_today').trigger({ name: trashTypes })
        }, then)
      })
    })
  }

  clearTrashInfoTriggers() {
    this.triggerInfo.filter(trigger => Array.isArray(trigger.handlers)).forEach(trigger => {
      if (trigger.handlers.length === 0) {
        this.log('clearTrashInfoTriggers --', `Timeouts not set for ${trigger.name}`)
        return
      }

      trigger.handlers.forEach(handler => {
        this.log('clearTrashInfoTriggers --', `Timeout for ${trigger.name} - ${handler.name}  cleared`)
        this.homey.clearTimeout(handler.id)
      })
    })
  }

  setNextTrashInfoRefresh() {
    const now = this.getMoment()
    const then = this.getMoment().set('hours', 23).set('minute', 0).set('second', 0)
    if (now.get('hours') === 23) {
      this.log('setNextTrashInfoRefresh --', `${this.getDateTimeString(now)} -- ${this.getDateTimeString(then)} -- pre`)
      then.add(1, 'day')
      this.log('setNextTrashInfoRefresh --', `${this.getDateTimeString(now)} -- ${this.getDateTimeString(then)} -- post`)
    }

    const nextRefresh = then - now
    const handle = this.triggerInfo.find(trigger => trigger.name === 'next_refresh')
    handle.id = this.homey.setTimeout(() => {
      this.setNextTrashInfoRefresh()
      this.getTrashInfo()
    }, nextRefresh)
    this.log('setNextTrashInfoRefresh --', 'Next info refresh set to', this.getDateTimeString(then))
  }

  getMoment(date) {
    return moment.tz(date || new Date(), appSettings.timezone)
  }
  
  getDateTimeString(moment) {
    return moment.format('DD.MM.yy HH:mm')
  }
}

module.exports = MyApp;
