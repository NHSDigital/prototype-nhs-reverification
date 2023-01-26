// External dependencies
const express = require('express');

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

router.get('/*', devModeRoute)

module.exports = router;
