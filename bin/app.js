#!/usr/bin/env node

const yargs = require('yargs')
const truecaller = require('../src/truecaller')
const helpers = require('../src/helpers')
const { logError, logInfo, validateNumber } = helpers

const registerNumber = async ({ number }) => {
  logInfo('Please wait while we are sending an OTP')
  const response = await truecaller.sendOtp(number)

  /** If Invalid Response */
  if (response.status !== 1) {
    logError(response.message)
    return false
  }

  /** 
   * Verify OTP function, Check if status invalid otp then try again with new secret code
   */
  const verifyOtp = async () => {
    let otp = await truecaller.promptOtp()
    let otpResponse = await truecaller.verifyOtp(number, response.requestId, otp)
    let { status, message } = otpResponse
    if (status === 11) {
      logError(message)
      return verifyOtp()
    }
    return otpResponse
  }

  /** 
   * Extract OTP Successfull Response
   */
  try {
    const otpResponse = await verifyOtp()
    const { installationId } = otpResponse
    if (!installationId) {
      throw new Error(otpResponse.message)
    }
    logInfo(`Your Installation ID is: ${installationId}`)

    truecaller.saveInstallationId(installationId)
    logInfo('Installation Id saved to config.json')
  } catch (err) {
    logError(err)
  }
}

const searchNumber = async ({ number }) => {
  try {
    const result = await truecaller.searchNumber(number)
    if (!result.name && !result.email) {
      logError('Not Found.')
      return false
    }
    let resultString = `Name: ${result.name}`
    resultString += result.email ? `\nEmail: ${result.email}` : ''
    logInfo(resultString)
  } catch (err) {
    logError(err)
  }
}

yargs.usage('Usage: truecaller <command> [options]')
  .command('register [number]', 'Register a New Number', yargs => yargs, registerNumber)
  .command('search [number]', 'Search a Mobile Number', yargs => {
    try {
      const installationId = truecaller.getInstallationId()
      truecaller.setInstallationId(installationId)
      return yargs
    } catch (err) {
      logError('Installtion Id not found, Please run the following command to register.')
      logInfo('```truecaller register 10_DIGIT_NUMBER```')
      process.exit()
    }
  }, searchNumber)
  .demandCommand()
  .middleware(({ number }) => {
    if (!validateNumber(number)) {
      logError('Not a valid Mobile Number')
      process.exit()
    }
  }).argv