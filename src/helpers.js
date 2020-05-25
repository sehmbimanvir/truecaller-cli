const chalk = require('chalk')

const deviceData = [
  {
    manufacturer: 'Google',
    models: [
      'Pixel XL',
      'Pixel 2XL',
      'Pixel 3XL',
      'Pixel 3aXL',
      'Pixel 4XL'
    ]
  }, {
    manufacturer: 'OnePlus',
    models: [
      'OnePlus 2',
      'OnePlus X',
      'OnePlus 7',
      'OnePlus 7 Pro',
      'OnePlus 7T'
    ]
  }
]

const helpers = {
  logError (message) {
    console.log(chalk.red(message))
  },
  logInfo (message) {
    console.log(chalk.green(message))
  },
  generateRandomString (length = 10) {
    const string = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const stringLength = string.length
    let randomString = ''
    for (let i = 0; i < length; i++) {
      randomString += string.charAt(helpers.getRandomNumber(0, stringLength))
    }
    return randomString
  },
  getRandomNumber (min, max) {
    return Math.floor(Math.random() * (max - min)) + min
  },
  getModelAndManufacturer () {
    let manfRandom = helpers.getRandomNumber(0, deviceData.length)
    let modelRandom = helpers.getRandomNumber(0, deviceData[manfRandom].models.length)
    return {
      manufacturer: deviceData[manfRandom].manufacturer,
      model: deviceData[manfRandom].models[modelRandom]
    }
  },
  getOSVersion () {
    const osVersion = helpers.getRandomNumber(7, 10)
    return osVersion.toFixed(1)
  },
  validateNumber (mobile) {
    return /^\d{10}$/.test(mobile)
  }
}

module.exports = helpers