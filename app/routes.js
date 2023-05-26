// External dependencies
const express = require('express')
const obfuscatorEmail = require('obfuscator-email')
const moment = require('moment')

const router = express.Router();

// GOV Notify integration - ask Matt F for the API key if you need it
var NotifyClient = require('notifications-node-client').NotifyClient,
  notify = new NotifyClient(process.env.NOTIFYAPIKEY)

// show all data store items in the terminal window
router.use((req, res, next) => {
  const log = {
    method: req.method,
    url: req.originalUrl,
    data: req.session.data
  }
  // you can enable this in your .env file
  if (process.env.LOGGING === 'TRUE') {
    console.log(JSON.stringify(log, null, 2))
  }
  next()
})

// V1 ROUTES

router.post('/v1/standalone/do-you-know-nhs', function (req, res) {
  var NHSnumber = req.session.data['knowNHSNumber']
  if (NHSnumber == 'yes'){
    res.redirect('/v1/standalone/what-is-your-dob')
  }else {
    res.redirect('/v1/standalone/what-is-your-name')
  }
})

// pds error screen. user chooses next action
router.post('/v1/standalone/pds-not-found-next', function (req, res) {
  var nextstep = req.session.data['pdserrornext']
  if (nextstep == 'trydifferentnhsno'){
    res.redirect('/v1/standalone/do-you-know-nhs')
  } else if (nextstep == 'searchpdswithname') {
    res.redirect('/v1/standalone/what-is-your-name')
  } else {
    res.redirect('/v1/standalone/go-to-gp')
  }
})


router.post('/v1/standalone/get-verification-otp', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod == 'email'){
    if (req.session.data['emailAddress'] !== '') {
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      var personalisation = {
        'name': req.session.data['given-names']
      }
      notify.sendEmail(
        '8a6fb1b2-3c73-4f79-bff7-0e837dfa3178',
        req.session.data['emailAddress'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v1/standalone/check-your-email')
  }else {
    if (req.session.data['mobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '42f4f14e-087c-4347-bc10-9005ee51cbdd',
        req.session.data['mobileNum'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v1/standalone/check-your-mobile')
  }
})

router.post('/v1/standalone/submit-new-mobile', function (req, res) {
  // trim out the white space we we can count it easier
  let number = req.session.data['newMobileNumber']

  let newMobileObf = ''

  // if the uk mobile number is filled-in correctly create an obfuscated version of it
  if (number && number.length === 11 ) {
    newMobileObf = '*******' + number.substr(-4)
  } else {
    // create a placeholder string as the field wasn't filled in properly
    newMobileObf = '*******6789'
  }

  req.session.data['newMobileObf'] = newMobileObf

  res.redirect('/v1/standalone/check-your-mobile')
})

router.post('/v1/standalone/get-verification-otp-new', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod == 'email'){
    if (req.session.data['newEmailAddress'] !== '') {
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        'eb57ad0c-eba9-42c7-a4bd-3e8d87a9843f',
        req.session.data['newEmailAddress'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent email")
    }
    res.redirect('/v1/standalone/check-your-email-verify-change')
  } else {
    if (req.session.data['newMobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '215c71e8-7431-4700-8dd4-cc4e9f0801a0',
        req.session.data['newMobileNum'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent SMS")
    }
    res.redirect('/v1/standalone/check-your-mobile-verify-change')
  }
})

// Dev Mode - Used to show routing by scenario other than user driven

function devModeRoute(req, res, next) {
  if (!req.session.data['devMode']) {
    console.log('no data found')
    var devMode = req.query.devMode
    if (devMode === 'true') {
      console.log('devmode detected')
      req.session.data['devMode'] = 'true'
      console.log('local storage updated')
    } else {
      console.log('devmode not detected')
    }
  } else {
    console.log('data found and set to ' + req.session.data['devMode'])
  }
  next()
}

// V2 ROUTES

router.post('/v2/standalone/do-you-know-nhs', function (req, res) {
  var NHSnumber = req.session.data['knowNHSNumber']
  if (NHSnumber == 'yes'){
    res.redirect('/v2/standalone/what-is-your-dob')
  }else {
    res.redirect('/v2/standalone/what-is-your-name')
  }
})

// pds error screen. user chooses next action
router.post('/v2/standalone/pds-not-found-next', function (req, res) {
  var nextstep = req.session.data['pdserrornext']
  if (nextstep == 'trydifferentnhsno'){
    res.redirect('/v2/standalone/do-you-know-nhs')
  } else if (nextstep == 'searchpdswithname') {
    res.redirect('/v2/standalone/what-is-your-name')
  } else {
    res.redirect('/v2/standalone/go-to-gp')
  }
})


router.post('/v2/standalone/get-verification-otp', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['emailAddress'] !== '') {
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      var personalisation = {
        'name': req.session.data['given-names']
      }
      notify.sendEmail(
        '8a6fb1b2-3c73-4f79-bff7-0e837dfa3178',
        req.session.data['emailAddress'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v2/standalone/check-your-email')
  }else {
    if (req.session.data['mobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '42f4f14e-087c-4347-bc10-9005ee51cbdd',
        req.session.data['mobileNum'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v2/standalone/check-your-mobile')
  }
})

router.post('/v2/standalone/submit-new-mobile', function (req, res) {
  // trim out the white space we we can count it easier
  let number = req.session.data['newMobileNumber']

  let newMobileObf = ''

  // if the uk mobile number is filled-in correctly create an obfuscated version of it
  if (number && number.length === 11 ) {
    newMobileObf = '*******' + number.substr(-4)
  } else {
    // create a placeholder string as the field wasn't filled in properly
    newMobileObf = '*******6789'
  }

  req.session.data['newMobileObf'] = newMobileObf

  res.redirect('/v2/standalone/check-your-mobile')
})

router.post('/v2/standalone/get-verification-otp-new', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['newEmailAddress'] !== '') {
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        'eb57ad0c-eba9-42c7-a4bd-3e8d87a9843f',
        req.session.data['newEmailAddress'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent email")
    }
    res.redirect('/v2/standalone/check-your-email-verify-change')
  } else {
    if (req.session.data['newMobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '215c71e8-7431-4700-8dd4-cc4e9f0801a0',
        req.session.data['newMobileNum'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent SMS")
    }
    res.redirect('/v2/standalone/check-your-mobile-verify-change')
  }
})

// V3 ROUTES

// triage steps

router.post('/v3/triage/triage-app-post', function (req, res) {
  var appuser = req.session.data['appuser']
    res.redirect('/v3/triage/triage-notified')
})

router.post('/v3/triage/triage-notified-post', function (req, res) {
  var notified = req.session.data['notified']
    res.redirect('/v3/triage/triage-which-details')
})

router.post('/v3/triage/triage-which-details-post', function (req, res) {
  var details = req.session.data['which-details']
  res.redirect('/v3/triage/methods')
})

// Methods page pre-render
router.get('/v3/triage/methods', function (req, res) {
  console.log('App user: ' + req.session.data['appuser'])
  console.log('Notified by NHS: ' + req.session.data['notified'])
  console.log('Details to update: ' + req.session.data['which-details'])

  let canUseApp = 'yes'
  let canUseWebService = 'yes'
  var details = req.session.data['which-details']

  if (details) {
    // parse the checkbox input
    for (i = 0; i < details.length; i++) {
      if (details[i] === 'email') {
        var updateEmail = 'yes'
      } else if (details[i] === 'mobile') {
        var updateMobile = 'yes'
      } else if (details[i] === 'address') {
        var updateAddress = 'yes'
      }
    }
  }

  if (updateAddress === 'yes') {
    canUseApp = 'no'
  }

  if (req.session.data['notified'] === 'no') {
    canUseWebService = 'no'
  }

  return res.render('v3/triage/methods', {
    'canUseApp': canUseApp,
    'canUseWebService': canUseWebService
  })
})


router.post('/v3/standalone/do-you-know-nhs', function (req, res) {
  var NHSnumber = req.session.data['knowNHSNumber']
  if (NHSnumber == 'yes'){
    res.redirect('/v3/standalone/what-is-your-dob')
  }else {
    res.redirect('/v3/standalone/what-is-your-name')
  }
})

// Obfuscate the UR participants contact details for display on the page
router.get('/v3/standalone/get-security-code', function (req, res) {
  console.log(process.env[req.session.data['ur']])
  if (req.session.data['ur']) {

    if (req.session.data['contactMethod'] === 'email') {
      let email = process.env[req.session.data['ur']]

      // create an obfuscated version of it
      if (email ) {
        emailObf = obfuscatorEmail(email)
      } else {
        // create a placeholder string as the field wasn't filled in properly
        emailObf = '*******6789'
      }

      req.session.data['emailAddress'] = email
      req.session.data['emailAddressObf'] = emailObf
      return res.render('v3/standalone/get-security-code', {
        'email': emailObf
      })
    } else {
      // pull in mobile number from environmant variable and create an obsfucated version

      let mobile = process.env[req.session.data['ur']]

      // create an obfuscated version of it
      if (mobile && mobile.length === 11 ) {
        mobileObf = '*******' + mobile.substr(-4)
      } else {
        // create a placeholder string as the field wasn't filled in properly
        mobileObf = '*******6789'
      }
      req.session.data['mobileNum'] = mobile
      req.session.data['mobileNumObf'] = mobileObf
      return res.render('v3/standalone/get-security-code', {
        'mobile': mobileObf
      })
    }
  } else {
    // do nothing
    return res.render('v3/standalone/get-security-code')
  }

})

// pds error screen. user chooses next action
router.post('/v3/standalone/pds-not-found-next', function (req, res) {
  var nextstep = req.session.data['pdserrornext']
  if (nextstep == 'trydifferentnhsno'){
    res.redirect('/v3/standalone/do-you-know-nhs')
  } else if (nextstep == 'searchpdswithname') {
    res.redirect('/v3/standalone/what-is-your-name')
  } else {
    res.redirect('/v3/standalone/go-to-gp')
  }
})


router.post('/v3/standalone/get-verification-otp', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['emailAddress'] !== '') {
      console.log('send email')
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        '8a6fb1b2-3c73-4f79-bff7-0e837dfa3178',
        req.session.data['emailAddress'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v3/standalone/check-your-email')
  }else {
    if (req.session.data['mobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '42f4f14e-087c-4347-bc10-9005ee51cbdd',
        req.session.data['mobileNum'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v3/standalone/check-your-mobile')
  }
})

router.post('/v3/standalone/submit-new-mobile', function (req, res) {
  // trim out the white space we we can count it easier
  let number = req.session.data['newMobileNumber']

  let newMobileObf = ''

  // if the uk mobile number is filled-in correctly create an obfuscated version of it
  if (number && number.length === 11 ) {
    newMobileObf = '*******' + number.substr(-4)
  } else {
    // create a placeholder string as the field wasn't filled in properly
    newMobileObf = '*******6789'
  }

  req.session.data['newMobileObf'] = newMobileObf

  res.redirect('/v3/standalone/check-your-mobile')
})

router.post('/v3/standalone/get-verification-otp-new', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['newEmailAddress'] !== '') {
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        'eb57ad0c-eba9-42c7-a4bd-3e8d87a9843f',
        req.session.data['newEmailAddress'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent email")
    }
    res.redirect('/v3/standalone/check-your-email-verify-change')
  } else {
    if (req.session.data['newMobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '215c71e8-7431-4700-8dd4-cc4e9f0801a0',
        req.session.data['newMobileNum'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent SMS")
    }
    res.redirect('/v3/standalone/check-your-mobile-verify-change')
  }
})

// V4 ROUTES

// triage step
router.post('/v4/standalone/triage-notified-post', function (req, res) {
  var notified = req.session.data['notified']
  if (notified === 'no'){
    res.redirect('/v4/standalone/other-channels')
  }else {
    res.redirect('/v4/standalone/use-login')
  }
})

router.post('/v4/standalone/do-you-know-nhs', function (req, res) {
  var NHSnumber = req.session.data['knowNHSNumber']
  if (NHSnumber === 'yes'){
    res.redirect('/v4/standalone/what-is-your-dob')
  }else {
    res.redirect('/v4/standalone/what-is-your-name')
  }
})

// Obfuscate the UR participants contact details for display on the page
router.get('/v4/standalone/get-security-code', function (req, res) {
  console.log(process.env[req.session.data['ur']])
  if (req.session.data['ur']) {

    if (req.session.data['contactMethod'] === 'email') {
      let email = process.env[req.session.data['ur']]

      // create an obfuscated version of it
      if (email ) {
        emailObf = obfuscatorEmail(email)
      } else {
        // create a placeholder string as the field wasn't filled in properly
        emailObf = '*******6789'
      }

      req.session.data['emailAddress'] = email
      req.session.data['emailAddressObf'] = emailObf
      return res.render('v4/standalone/get-security-code', {
        'email': emailObf
      })
    } else {
      // pull in mobile number from environmant variable and create an obsfucated version

      let mobile = process.env[req.session.data['ur']]

      // create an obfuscated version of it
      if (mobile && mobile.length === 11 ) {
        mobileObf = '*******' + mobile.substr(-4)
      } else {
        // create a placeholder string as the field wasn't filled in properly
        mobileObf = '*******6789'
      }
      req.session.data['mobileNum'] = mobile
      req.session.data['mobileNumObf'] = mobileObf
      req.session.data['nhslogin'] = "false"
      return res.render('v4/standalone/get-security-code', {
        'mobile': mobileObf
      })
    }
  } else {
    // do nothing
    req.session.data['nhslogin'] = "false"
    return res.render('v4/standalone/get-security-code')
  }

})

// pds error screen. user chooses next action
router.post('/v4/standalone/pds-not-found-next', function (req, res) {
  var nextstep = req.session.data['pdserrornext']
  if (nextstep === 'trydifferentnhsno'){
    res.redirect('/v4/standalone/do-you-know-nhs')
  } else if (nextstep === 'searchpdswithname') {
    res.redirect('/v4/standalone/what-is-your-name')
  } else {
    res.redirect('/v4/standalone/go-to-gp')
  }
})


router.post('/v4/standalone/get-verification-otp', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['emailAddress'] !== '') {
      console.log('send email')
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        '8a6fb1b2-3c73-4f79-bff7-0e837dfa3178',
        req.session.data['emailAddress'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v4/standalone/check-your-email')
  }else {
    if (req.session.data['mobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '42f4f14e-087c-4347-bc10-9005ee51cbdd',
        req.session.data['mobileNum'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v4/standalone/check-your-mobile')
  }
})

router.post('/v4/standalone/submit-new-mobile', function (req, res) {
  // trim out the white space we we can count it easier
  let number = req.session.data['newMobileNumber']

  let newMobileObf = ''

  // if the uk mobile number is filled-in correctly create an obfuscated version of it
  if (number && number.length === 11 ) {
    newMobileObf = '*******' + number.substr(-4)
  } else {
    // create a placeholder string as the field wasn't filled in properly
    newMobileObf = '*******6789'
  }

  req.session.data['newMobileObf'] = newMobileObf

  res.redirect('/v4/standalone/check-your-mobile')
})

router.post('/v4/standalone/get-verification-otp-new', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['newEmailAddress'] !== '') {
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        'eb57ad0c-eba9-42c7-a4bd-3e8d87a9843f',
        req.session.data['newEmailAddress'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent email")
    }
    res.redirect('/v4/standalone/check-your-email-verify-change')
  } else {
    if (req.session.data['newMobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '215c71e8-7431-4700-8dd4-cc4e9f0801a0',
        req.session.data['newMobileNum'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent SMS")
    }
    res.redirect('/v4/standalone/check-your-mobile-verify-change')
  }
})

// route if not an NHS login account holder
router.post('/v4/standalone/verify-change-post', function (req, res) {
  // trim out the white space we we can count it easier
  let nhslogin = req.session.data['nhslogin']

  if (nhslogin === 'false'){
    res.redirect('/v4/standalone/create-account')
  }else {
    res.redirect('/v4/standalone/confirmation-of-change')
  }
})

router.post('/v4/standalone/create-account-post', function (req, res) {
  // trim out the white space we we can count it easier
  let createAccount = req.session.data['create-account']

  if (createAccount === 'no'){
    res.redirect('/v4/standalone/confirmation-of-change')
  }else {
    res.redirect('/v4/standalone/confirmation-of-change')
  }
})

// V5 ROUTES

// triage step
router.post('/v5/standalone/triage-notified-post', function (req, res) {
  var notified = req.session.data['notified']
  if (notified === 'no'){
    res.redirect('/v5/standalone/other-channels')
  }else {
    res.redirect('/v5/standalone/do-you-know-nhs')
  }
})

router.post('/v5/standalone/do-you-know-nhs', function (req, res) {
  var NHSnumber = req.session.data['knowNHSNumber']
  if (NHSnumber === 'yes'){
    res.redirect('/v5/standalone/what-is-your-dob')
  }else {
    res.redirect('/v5/standalone/what-is-your-name')
  }
})

// Obfuscate the UR participants contact details for display on the page
router.get('/v5/standalone/get-security-code', function (req, res) {
  console.log(process.env[req.session.data['ur']])
  if (req.session.data['ur']) {

    if (req.session.data['contactMethod'] === 'email') {
      let email = process.env[req.session.data['ur']]

      // create an obfuscated version of it
      if (email ) {
        emailObf = obfuscatorEmail(email)
      } else {
        // create a placeholder string as the field wasn't filled in properly
        emailObf = '*******6789'
      }

      req.session.data['emailAddress'] = email
      req.session.data['emailAddressObf'] = emailObf
      return res.render('v4/standalone/get-security-code', {
        'email': emailObf
      })
    } else {
      // pull in mobile number from environmant variable and create an obsfucated version

      let mobile = process.env[req.session.data['ur']]

      // create an obfuscated version of it
      if (mobile && mobile.length === 11 ) {
        mobileObf = '*******' + mobile.substr(-4)
      } else {
        // create a placeholder string as the field wasn't filled in properly
        mobileObf = '*******6789'
      }
      req.session.data['mobileNum'] = mobile
      req.session.data['mobileNumObf'] = mobileObf
      req.session.data['nhslogin'] = "false"
      return res.render('v5/standalone/get-security-code', {
        'mobile': mobileObf
      })
    }
  } else {
    // do nothing
    req.session.data['nhslogin'] = "false"
    return res.render('v5/standalone/get-security-code')
  }

})

// pds error screen. user chooses next action
router.post('/v5/standalone/pds-not-found-next', function (req, res) {
  var nextstep = req.session.data['pdserrornext']
  if (nextstep === 'trydifferentnhsno'){
    res.redirect('/v5/standalone/do-you-know-nhs')
  } else if (nextstep === 'searchpdswithname') {
    res.redirect('/v5/standalone/what-is-your-name')
  } else {
    res.redirect('/v5/standalone/go-to-gp')
  }
})


router.post('/v5/standalone/get-verification-otp', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['emailAddress'] !== '') {
      console.log('send email')
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        '8a6fb1b2-3c73-4f79-bff7-0e837dfa3178',
        req.session.data['emailAddress'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v5/standalone/check-your-email')
  }else {
    if (req.session.data['mobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '42f4f14e-087c-4347-bc10-9005ee51cbdd',
        req.session.data['mobileNum'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v5/standalone/check-your-mobile')
  }
})

router.post('/v5/standalone/submit-new-mobile', function (req, res) {
  // trim out the white space we we can count it easier
  let number = req.session.data['newMobileNumber']

  let newMobileObf = ''

  // if the uk mobile number is filled-in correctly create an obfuscated version of it
  if (number && number.length === 11 ) {
    newMobileObf = '*******' + number.substr(-4)
  } else {
    // create a placeholder string as the field wasn't filled in properly
    newMobileObf = '*******6789'
  }

  req.session.data['newMobileObf'] = newMobileObf

  res.redirect('/v5/standalone/check-your-mobile')
})

router.post('/v5/standalone/get-verification-otp-new', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['newEmailAddress'] !== '') {
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        'eb57ad0c-eba9-42c7-a4bd-3e8d87a9843f',
        req.session.data['newEmailAddress'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent email")
    }
    res.redirect('/v5/standalone/check-your-email-verify-change')
  } else {
    if (req.session.data['newMobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '215c71e8-7431-4700-8dd4-cc4e9f0801a0',
        req.session.data['newMobileNum'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent SMS")
    }
    res.redirect('/v5/standalone/check-your-mobile-verify-change')
  }
})

// route if not an NHS login account holder
router.post('/v5/standalone/verify-change-post', function (req, res) {
  // trim out the white space we we can count it easier
  let nhslogin = req.session.data['nhslogin']

  if (nhslogin === 'false'){
    res.redirect('/v5/standalone/create-account')
  }else {
    res.redirect('/v5/standalone/confirmation-of-change')
  }
})

router.post('/v5/standalone/create-account-post', function (req, res) {
  // trim out the white space we we can count it easier
  let createAccount = req.session.data['create-account']

  if (createAccount === 'no'){
    res.redirect('/v5/standalone/confirmation-of-change')
  }else {
    res.redirect('/v5/standalone/confirmation-of-change')
  }
})


// V6 ROUTES

// triage step
router.post('/v6/standalone/triage-address-post', function (req, res) {
  var address = req.session.data['address']
  if (address === 'no'){
    res.redirect('/v6/standalone/do-you-know-nhs')
  }else {
    res.redirect('/v6/standalone/other-channels')
  }
})

router.post('/v6/standalone/do-you-know-nhs', function (req, res) {
  var NHSnumber = req.session.data['knowNHSNumber']
  if (NHSnumber === 'yes'){
    res.redirect('/v6/standalone/what-is-your-dob')
  }else {
    res.redirect('/v6/standalone/what-is-your-name')
  }
})

router.post('/v6/standalone/check-your-answers-post', function (req, res) {
  var result = req.session.data['result']
  if (result === 'singlegood'){
    res.redirect('/v6/standalone/get-security-code')
  }else {
    res.redirect('/v6/standalone/pick-security-detail')
  }
})

// Obfuscate the UR participants contact details for display on the page
router.get('/v6/standalone/contact-details', function (req, res) {
  // if user has come without a notification
  if (req.session.data['ure'] && req.session.data['urm']) {

    let email = process.env[req.session.data['ure']]
    let mobile = process.env[req.session.data['urm']]

    // create an obfuscated version of email
    if (email ) {
      emailObf = obfuscatorEmail(email)
    } else {
      // create a placeholder string as the field wasn't filled in properly
      emailObf = '********lor@****l.com'
    }

    // create an obfuscated version of mobile
    if (mobile && mobile.length === 11 ) {
      mobileObf = '*******' + mobile.substr(-4)
    } else {
      // create a placeholder string as the field wasn't filled in properly
      mobileObf = '*******6789'
    }

    // write values to the data store
    req.session.data['emailAddress'] = email
    req.session.data['emailAddressObf'] = emailObf
    req.session.data['mobileNum'] = mobile
    req.session.data['mobileNumObf'] = mobileObf

    return res.render('v6/standalone/contact-details', {
      'email': emailObf,
      'mobile': mobileObf
    })

  } else if (req.session.data['ure'] || req.session.data['urm']) {

      if (req.session.data['contactMethod'] === 'email') {
        let email = process.env[req.session.data['ure']]

        // create an obfuscated version of it
        if (email ) {
          emailObf = obfuscatorEmail(email)
        } else {
          // create a placeholder string as the field wasn't filled in properly
          emailObf = '********lor@****l.com'
        }
        // write values to the data store
        req.session.data['emailAddress'] = email
        req.session.data['emailAddressObf'] = emailOb

        return res.render('v6/standalone/contact-details', {
          'email': emailObf
        })

      } else {
        // pull in mobile number from environment variable and create an obsfucated version
        let mobile = process.env[req.session.data['urm']]

        // create an obfuscated version of it
        if (mobile && mobile.length === 11 ) {
          mobileObf = '*******' + mobile.substr(-4)
        } else {
          // create a placeholder string as the field wasn't filled in properly
          mobileObf = '*******6789'
        }
        req.session.data['mobileNum'] = mobile
        req.session.data['mobileNumObf'] = mobileObf
        return res.render('v6/standalone/contact-details', {
          'mobile': mobileObf
        })
      }
  } else {
    // do nothing
    return res.render('v6/standalone/contact-details')
  }

})

// Obfuscate the UR participants contact details for display on the page
router.get('/v6/standalone/get-security-code', function (req, res) {
  console.log(process.env[req.session.data['ur']])
  if (req.session.data['ur']) {

    if (req.session.data['contactMethod'] === 'email') {
      let email = process.env[req.session.data['ure']]

      // create an obfuscated version of it
      if (email ) {
        emailObf = obfuscatorEmail(email)
      } else {
        // create a placeholder string as the field wasn't filled in properly
        emailObf = '*******6789'
      }

      req.session.data['emailAddress'] = email
      req.session.data['emailAddressObf'] = emailObf
      return res.render('v6/standalone/get-security-code', {
        'email': emailObf
      })
    } else {
      // pull in mobile number from environment variable and create an obsfucated version

      let mobile = process.env[req.session.data['urp']]

      // create an obfuscated version of it
      if (mobile && mobile.length === 11 ) {
        mobileObf = '*******' + mobile.substr(-4)
      } else {
        // create a placeholder string as the field wasn't filled in properly
        mobileObf = '*******6789'
      }
      req.session.data['mobileNum'] = mobile
      req.session.data['mobileNumObf'] = mobileObf
      req.session.data['nhslogin'] = "false"
      return res.render('v6/standalone/get-security-code', {
        'mobile': mobileObf
      })
    }
  } else {
    // do nothing
    req.session.data['nhslogin'] = "false"
    return res.render('v6/standalone/get-security-code')
  }

})

// pds error screen. user chooses next action
router.post('/v6/standalone/pds-not-found-next', function (req, res) {
  var nextstep = req.session.data['pdserrornext']
  if (nextstep === 'trydifferentnhsno'){
    res.redirect('/v6/standalone/do-you-know-nhs')
  } else if (nextstep === 'searchpdswithname') {
    res.redirect('/v6/standalone/what-is-your-name')
  } else {
    res.redirect('/v6/standalone/go-to-gp')
  }
})


router.post('/v6/standalone/get-verification-otp', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['emailAddress'] !== '') {
      console.log('send email')
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        '8a6fb1b2-3c73-4f79-bff7-0e837dfa3178',
        req.session.data['emailAddress'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v6/standalone/check-your-email')
  }else {
    if (req.session.data['mobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '42f4f14e-087c-4347-bc10-9005ee51cbdd',
        req.session.data['mobileNum'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v6/standalone/check-your-mobile')
  }
})

router.post('/v6/standalone/submit-new-mobile', function (req, res) {
  // trim out the white space we we can count it easier
  let number = req.session.data['newMobileNumber']

  let newMobileObf = ''

  // if the uk mobile number is filled-in correctly create an obfuscated version of it
  if (number && number.length === 11 ) {
    newMobileObf = '*******' + number.substr(-4)
  } else {
    // create a placeholder string as the field wasn't filled in properly
    newMobileObf = '*******6789'
  }

  req.session.data['newMobileObf'] = newMobileObf

  res.redirect('/v6/standalone/check-your-mobile')
})

router.post('/v6/standalone/get-verification-otp-new', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['newEmailAddress'] !== '') {
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        'eb57ad0c-eba9-42c7-a4bd-3e8d87a9843f',
        req.session.data['newEmailAddress'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent email")
    }
    res.redirect('/v6/standalone/check-your-email-verify-change')
  } else {
    if (req.session.data['newMobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '215c71e8-7431-4700-8dd4-cc4e9f0801a0',
        req.session.data['newMobileNum'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent SMS")
    }
    res.redirect('/v6/standalone/check-your-mobile-verify-change')
  }
})

// send
router.post('/v6/standalone/verify-change-post', function (req, res) {
  var contactMethod = req.session.data['contactMethod']
  var result = req.session.data['result']

  // always send confirmation to the email address
  // this is existing email address if they have changed mobile or new Email if they changed email

  // contact methodis is email is means we can send to existing email
  if (req.session.data['newEmailAddress']){
    // generate a random 6 digit number for the SMS
    var pinCode1 = Math.floor(100 + Math.random() * 900)
    var pinCode2 = Math.floor(100 + Math.random() * 900)
    var personalisation = {
      'otp_code': pinCode1 + "" + pinCode2,
      'firstname': "Matt"
    }
    notify.sendEmail(
      'a9740904-4999-403e-aed0-64be567ce63f',
      req.session.data['newEmailAddress'],
      {personalisation: personalisation}
    ).catch(err => console.error(err))
    console.log("sent email")
  } else {
    // generate a random 6 digit number for the Email
    var pinCode1 = Math.floor(100 + Math.random() * 900)
    var pinCode2 = Math.floor(100 + Math.random() * 900)
    var personalisation = {
      'otp_code': pinCode1 + "" + pinCode2,
      'firstname': "Matt"
    }
    notify.sendEmail(
      'a9740904-4999-403e-aed0-64be567ce63f',
      req.session.data['emailAddress'],
      {personalisation: personalisation}
    ).catch(err => console.error(err))
    console.log("sent email")
  }
  // hide for UR sessions
  // if (result === 'bothgood'){

    // if (contactMethod === 'email'){
    //   if (req.session.data['newEmailAddress'] !== '') {
    //     // generate a random 6 digit number for the Email
    //     var pinCode1 = Math.floor(100 + Math.random() * 900)
    //     var pinCode2 = Math.floor(100 + Math.random() * 900)
    //     var personalisation = {
    //       'otp_code': pinCode1 + "" + pinCode2,
    //       'firstname': "Matt"
    //     }
    //     notify.sendEmail(
    //       '96ff77f9-7525-44c3-880c-86d5ff05165f',
    //       req.session.data['newEmailAddress'],
    //       {personalisation: personalisation}
    //     ).catch(err => console.error(err))
    //     console.log("sent 2nd email")
    //   }
    // } else {
    //   if (req.session.data['newMobileNum'] !== '') {
    //     // generate a random 6 digit number for the SMS
    //     var pinCode1 = Math.floor(100 + Math.random() * 900)
    //     var pinCode2 = Math.floor(100 + Math.random() * 900)
    //     var personalisation = {
    //       'otp_code': pinCode1 + "" + pinCode2,
    //       'firstname': "Matt"
    //     }
    //     notify.sendSms(
    //       '254dfd8b-9c74-4d5d-8c12-3b80073f5480',
    //       req.session.data['newMobileNum'],
    //       {personalisation: personalisation}
    //     ).catch(err => console.error(err))
    //     console.log("sent 2nd SMS")
    //   }
    // }
  // }
  if (req.session.data['feedback'] === 'new') {
    res.redirect('/v6/standalone/confirmation-of-change-2')
  } else {
    res.redirect('/v6/standalone/confirmation-of-change')
  }
})

router.post('/v6/standalone/create-account-post', function (req, res) {
  // trim out the white space we we can count it easier
  let createAccount = req.session.data['create-account']

  if (createAccount === 'no'){
    res.redirect('/v6/standalone/confirmation-of-change')
  }else {
    res.redirect('/v6/standalone/confirmation-of-change')
  }
})


// V7 ROUTES

// triage step
router.post('/v7/standalone/triage-address-post', function (req, res) {
  var address = req.session.data['address']
  if (address === 'no'){
    res.redirect('/v7/standalone/use-login')
  }else {
    res.redirect('/v7/standalone/other-channels')
  }
})

router.post('/v7/standalone/do-you-know-nhs', function (req, res) {
  var NHSnumber = req.session.data['knowNHSNumber']
  if (NHSnumber === 'yes'){
    res.redirect('/v7/standalone/what-is-your-dob')
  }else {
    res.redirect('/v7/standalone/what-is-your-name')
  }
})

router.post('/v7/standalone/use-login-post', function (req, res) {
  req.session.data['uselogin'] = "true"
  res.redirect('/v7/standalone/nhs-login-email')
})
href="nhs-login-email"

router.post('/v7/standalone/check-your-answers-post', function (req, res) {
  var result = req.session.data['result']
  if (result === 'singlegood'){
    res.redirect('/v7/standalone/get-security-code')
  }else {
    res.redirect('/v7/standalone/pick-security-detail')
  }
})

// Obfuscate the UR participants contact details for display on the page
router.get('/v7/standalone/get-security-code', function (req, res) {
  console.log(process.env[req.session.data['ur']])
  if (req.session.data['ur']) {

    if (req.session.data['contactMethod'] === 'email') {
      let email = process.env[req.session.data['ur']]

      // create an obfuscated version of it
      if (email ) {
        emailObf = obfuscatorEmail(email)
      } else {
        // create a placeholder string as the field wasn't filled in properly
        emailObf = '*******6789'
      }

      req.session.data['emailAddress'] = email
      req.session.data['emailAddressObf'] = emailObf
      return res.render('v7/standalone/get-security-code', {
        'email': emailObf
      })
    } else {
      // pull in mobile number from environmant variable and create an obsfucated version

      let mobile = process.env[req.session.data['ur']]

      // create an obfuscated version of it
      if (mobile && mobile.length === 11 ) {
        mobileObf = '*******' + mobile.substr(-4)
      } else {
        // create a placeholder string as the field wasn't filled in properly
        mobileObf = '*******6789'
      }
      req.session.data['mobileNum'] = mobile
      req.session.data['mobileNumObf'] = mobileObf
      req.session.data['nhslogin'] = "false"
      return res.render('v7/standalone/get-security-code', {
        'mobile': mobileObf
      })
    }
  } else {
    // do nothing
    req.session.data['nhslogin'] = "false"
    return res.render('v7/standalone/get-security-code')
  }

})

// pds error screen. user chooses next action
router.post('/v7/standalone/pds-not-found-next', function (req, res) {
  var nextstep = req.session.data['pdserrornext']
  if (nextstep === 'trydifferentnhsno'){
    res.redirect('/v7/standalone/do-you-know-nhs')
  } else if (nextstep === 'searchpdswithname') {
    res.redirect('/v7/standalone/what-is-your-name')
  } else {
    res.redirect('/v7/standalone/go-to-gp')
  }
})


router.post('/v7/standalone/get-verification-otp', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['emailAddress'] !== '') {
      console.log('send email')
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        '8a6fb1b2-3c73-4f79-bff7-0e837dfa3178',
        req.session.data['emailAddress'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v7/standalone/check-your-email')
  }else {
    if (req.session.data['mobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '42f4f14e-087c-4347-bc10-9005ee51cbdd',
        req.session.data['mobileNum'],
        { personalisation: personalisation }
      ).catch(err => console.error(err))
    }
    res.redirect('/v7/standalone/check-your-mobile')
  }
})

router.post('/v7/standalone/submit-new-mobile', function (req, res) {
  // trim out the white space we we can count it easier
  let number = req.session.data['newMobileNumber']

  let newMobileObf = ''

  // if the uk mobile number is filled-in correctly create an obfuscated version of it
  if (number && number.length === 11 ) {
    newMobileObf = '*******' + number.substr(-4)
  } else {
    // create a placeholder string as the field wasn't filled in properly
    newMobileObf = '*******6789'
  }

  req.session.data['newMobileObf'] = newMobileObf

  res.redirect('/v7/standalone/check-your-mobile')
})

router.post('/v7/standalone/get-verification-otp-new', function (req, res) {
  var contactMethod = req.session.data['contactMethod']

  if (contactMethod === 'email'){
    if (req.session.data['newEmailAddress'] !== '') {
      // generate a random 6 digit number for the Email
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendEmail(
        'eb57ad0c-eba9-42c7-a4bd-3e8d87a9843f',
        req.session.data['newEmailAddress'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent email")
    }
    res.redirect('/v7/standalone/check-your-email-verify-change')
  } else {
    if (req.session.data['newMobileNum'] !== '') {
      // generate a random 6 digit number for the SMS
      var pinCode1 = Math.floor(100 + Math.random() * 900)
      var pinCode2 = Math.floor(100 + Math.random() * 900)
      var personalisation = {
        'otp_code': pinCode1 + "" + pinCode2
      }
      notify.sendSms(
        '215c71e8-7431-4700-8dd4-cc4e9f0801a0',
        req.session.data['newMobileNum'],
        {personalisation: personalisation}
      ).catch(err => console.error(err))
      console.log("sent SMS")
    }
    res.redirect('/v7/standalone/check-your-mobile-verify-change')
  }
})

// route if not an NHS login account holder
router.post('/v7/standalone/verify-change-post', function (req, res) {
  // trim out the white space we we can count it easier
  let nhslogin = req.session.data['nhslogin']

  if (nhslogin === 'false'){
    res.redirect('/v7/standalone/confirmation-of-change')
  }else {
    res.redirect('/v7/standalone/confirmation-of-change')
  }
})

router.post('/v7/standalone/create-account-post', function (req, res) {
  // trim out the white space we we can count it easier
  let createAccount = req.session.data['create-account']

  if (createAccount === 'no'){
    res.redirect('/v7/standalone/confirmation-of-change')
  }else {
    res.redirect('/v7/standalone/confirmation-of-change')
  }
})

// Dev Mode - Used to show routing by scenario other than user driven

function devModeRoute(req, res, next) {
  if (!req.session.data['devMode']) {
    console.log('no data found')
    var devMode = req.query.devMode
    if (devMode === 'true') {
      console.log('devmode detected')
      req.session.data['devMode'] = 'true'
      console.log('local storage updated')
    } else {
      console.log('devmode not detected')
    }
  } else {
    console.log('data found and set to ' + req.session.data['devMode'])
  }
  next()
}

router.get('/*', devModeRoute)

// Delete query string if clearQuery set
// This lets us give urls to research participants that set up data correctly / and have the query string self-delete once done
// router.get('*', function(req, res, next) {
//   const data = req.session.data
//   let requestedUrl = url.parse(req.url).pathname
//   if (req?.query?.clearQuery) {
//     delete req.session.data.clearQuery
//     res.redirect(requestedUrl)
//   } else {
//     next()
//   }
// })

module.exports = router;
