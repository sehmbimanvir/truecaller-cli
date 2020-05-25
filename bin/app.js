#!/usr/bin/env node

const chalk = require('chalk')
const yargs = require('yargs')
const truecaller = require('../src/truecaller')
const helpers = require('../src/helpers')

const {logError, logInfo} = helpers

const options = yargs.option("r", {
  alias: "register",
  describe: "Register a new mobile number",
  type: "number"
}).option("s", {
  alias: "search",
  describe: "Search mobile number",
  type: "number"
}).argv

if (options.hasOwnProperty('r')) {
  const mobile = options.r;

  process.exit(0)

  (async () => {
    if (!truecaller.validateNumber(mobile)) {
      logError('Invalid Mobile Number. Please try again!')
      process.exit()
    }

    logInfo('Please wait while we are sending an OTP')

    const response = await truecaller.sendOtp(mobile)

    if (response.status !== 1) {
      console.log(chalk.red(response.message))
      return false
    }

    const verifyOtp = async () => {
      let otp = await truecaller.promptOtp()
      let otpResponse = await truecaller.verifyOtp(mobile, response.requestId, otp)
      let {status, message} = otpResponse
      if (status === 11) {
        logError(message)
        return verifyOtp()
      }
      return otpResponse
    }
    
    const otpResponse = await verifyOtp()

    const {installationId} = otpResponse

    if (!installationId) {
      logError(otpResponse.message)
      return false
    }

    logInfo(`Your Installation ID is: ${installationId}`)
    
    try {
      truecaller.setInstallationId(installationId)
      logInfo('Installation Id saved to config.json')
    } catch (err) {
      logError(err)
    }
  })()
} else if (options.hasOwnProperty('s')) {
  const mobile = options.s;

  (async() => {

    if (!truecaller.validateNumber(mobile)) {
      logError('Invalid Mobile Number. Please try again!')
      process.exit()
    }

    /** Get Installation Id */
    try {
      const result = await truecaller.searchNumber(mobile)
      let resultString = `Name: ${result.name}`
      resultString += result.email ? `\nEmail: ${result.email}` : ''
      logInfo(resultString)
    }  catch (err) {
      logError(err)
    }
  })()
}

          