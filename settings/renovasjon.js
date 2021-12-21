// a method named 'onHomeyReady' must be present in your code
function onHomeyReady (Homey) {
  // Tell Homey we're ready to be displayed
  Homey.ready()

  // setting ids
  const settingsAddress = 'address'
  const getDataFailed = 'getDataFailed'

  // buttons
  const btnSearch = document.getElementById('search')
  const btnSave = document.getElementById('save')

  // fields
  const searchString = document.getElementById('searchString')
  const streetName = document.getElementById('streetName')
  const houseNo = document.getElementById('houseNo')
  const streetCode = document.getElementById('streetCode')
  const countyId = document.getElementById('countyId')
  const countyName = document.getElementById('countyName')

  // get settings
  Homey.get(settingsAddress, (error, address) => {
    if (error) return Homey.alert(error)
    showAddress(address)
  })

  // save settings
  btnSave.addEventListener('click', function (e) {
    const address = getAddress(Homey)
    if (address) {
      Homey.set(settingsAddress, address, error => {
        if (error) return Homey.alert(error)
      })

      hideError()
      Homey.alert(Homey.__('settings.saved'), 'info')
    }
  })

  // search for address
  btnSearch.addEventListener('click', async function (e) {
    hideError()

    const addresses = await getAddressInfo(searchString.value)
    if (!addresses) {
      showError(`${Homey.__('settings.errors.search_failed')} ${searchString.value}`)
      return
    }
    else if (typeof addresses === 'string') {
      showError(addresses)
      return
    }
    else if (!Array.isArray(addresses.adresser) || addresses.adresser.length === 0) {
      showError(`${Homey.__('settings.errors.search_no_results')} ${searchString.value}`)
      return
    }
    else if (addresses.adresser.length > 1) {
      Homey.alert(`${Homey.__('settings.warnings.search_multiple_results').replace('%address%', searchString.value)}`)
    }

    const address = addresses.adresser[0]
    streetName.value = address.adressenavn
    houseNo.value = address.nummer
    streetCode.value = address.adressekode
    countyId.value = address.kommunenummer
    countyName.value = address.kommunenavn
  })

  // get get_data_failed setting
  Homey.get(getDataFailed, (error, msg) => {
    if (error) return Homey.alert(error)

    if (msg) {
      showError(msg)
    }
  })
}

async function getAddressInfo(searchString) {
  try {
    const { data } = await axios.get(encodeURI(`https://ws.geonorge.no/adresser/v1/sok?sok=${searchString}`))
    return data
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) return error.response.data.message
    return 'Feilet ved adressesøk'
  }
}

function getAddress(Homey) {
  const streetName = document.getElementById('streetName')
  const houseNo = document.getElementById('houseNo')
  const streetCode = document.getElementById('streetCode')
  const countyId = document.getElementById('countyId')
  const countyName = document.getElementById('countyName')

  if (streetName.value.trim() === '' || houseNo.value.trim() === '' || streetCode.value.trim() === '' || countyId.value.trim() === '') {
    showError(`Search to autofill failed.<br>Required fields: <,>${Homey.__('settings.streetName')}, ${Homey.__('settings.houseNo')}, ${Homey.__('settings.streetCode')}, ${Homey.__('settings.countyId')}</i>`)
    return false
  }

  return {
    streetName: streetName.value.trim(),
    houseNo: houseNo.value.trim(),
    streetCode: streetCode.value.trim(),
    countyId: countyId.value.trim(),
    countyName: countyName.value.trim()
  }
}

function showAddress(address = {}) {
  const streetName = document.getElementById('streetName')
  const houseNo = document.getElementById('houseNo')
  const streetCode = document.getElementById('streetCode')
  const countyId = document.getElementById('countyId')
  const countyName = document.getElementById('countyName')


  streetName.value = (address && address.streetName) || ''
  houseNo.value = (address && address.houseNo) || ''
  streetCode.value = (address && address.streetCode) || ''
  countyId.value = (address && address.countyId) || ''
  countyName.value = (address && address.countyName) || ''
}

function showError(text) {
  const errors = document.getElementById('errors')

  errors.innerHTML = text
  errors.classList = 'errors-show'
}

function hideError() {
  const errors = document.getElementById('errors')

  errors.classList = 'errors-hidden'
}
