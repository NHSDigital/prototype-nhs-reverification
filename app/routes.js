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


router.post('/v1/standalone/submitdetails', function (req, res) {
  var contactMethod = req.session.data['contactMethod']
  if (contactMethod == 'email'){
    res.redirect('/v1/standalone/check-your-email')
  }else {
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
