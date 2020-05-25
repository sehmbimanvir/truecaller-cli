const axios = require('axios')
const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

const configFilePath = path.join(__dirname, '..', 'config.json')

const axiosInstance = axios.create({
  headers: {
    clientSecret: 'lvc22mp3l1sfv6ujg83rd17btt',
    'User-Agent': 'Truecaller/11.7.5 (Android;6.0)',
    'Content-Type': 'application/json'
  }
})

const { generateRandomString, getModelAndManufacturer, getOSVersion } = helpers

const truecaller = {
  sendOtp: mobile => {
    const deviceData = truecaller.generateDeviceData(mobile)
    return axiosInstance.post(`https://account-asia-south1.truecaller.com/v2/sendOnboardingOtp`, deviceData)
    .then(response => {
      return response.data
    }, err => {
      return err.response.data
    })
  },

  generateDeviceData: phoneNumber => {
    let deviceDetails = getModelAndManufacturer()
    return {
      countryCode: "in",
      dialingCode: 91,
      installationDetails: {
        app: {
          buildVersion: 5,
          majorVersion: 11,
          minorVersion: 7,
          store: "GOOGLE_PLAY"
        },
        device: {
          deviceId: generateRandomString(15),
          language: "en",
          manufacturer: deviceDetails.manufacturer,
          model: deviceDetails.model,
          osName: "Android",
          osVersion: getOSVersion(),
          mobileServices: [
            "GMS"
          ]
        },
        language: "en"
      },
      phoneNumber: phoneNumber.toString(),
      region: 'region-2',
      sequenceNo: 2
    }
  },

  

  verifyOtp: (mobile, requestId, token) => {
    const postData = {
      countryCode: "in",
      dialingCode: 91,
      phoneNumber: mobile.toString(),
      requestId,
      token
    }
    return axiosInstance.post(`https://account-asia-south1.truecaller.com/v1/verifyOnboardingOtp`, postData)
    .then(response => response.data, err => err.response.data)
  },

  promptOtp: () => {
    const questions = [{
      type: 'input',
      name: 'otp',
      message: 'Enter an OTP: '
    }]

    return inquirer.prompt(questions)
      .then(answer => {
        if (answer.otp.length < 5) {
          return truecaller.promptOtp()
        }
        return answer.otp
      })
  },

  formatSearchResult: (data) => {
    const { name } = data
    let emailIndex = data.internetAddresses.findIndex(item => item.service === 'email')
    const email = emailIndex !== -1 ? data.internetAddresses[emailIndex].id : ''
    return { name, email }
  },

  getInstallationId: () => {
    const data = fs.readFileSync(configFilePath, 'utf8')
    return JSON.parse(data).installationId
  },

  searchNumber: mobile => {
    const installationId = truecaller.getInstallationId()
    return axiosInstance.get(`https://search5-noneu.truecaller.com/v2/search`, {
      params: {
        q: mobile,
        countryCode: 'IN',
        type: 4,
        locAddr: '',
        placement: 'SEARCHRESULTS,HISTORY,DETAILS',
        encoding: 'json'
      },
      headers: {
        Authorization: `Bearer ${installationId}`
      }
    })
    .then(response => {
      return truecaller.formatSearchResult(response.data.data[0])
    }, err => err.response.data)
  },

  setInstallationId: (installationId) => {
    const data = { installationId }
    fs.writeFileSync(configFilePath, JSON.stringify(data))
  }
}

module.exports = truecaller