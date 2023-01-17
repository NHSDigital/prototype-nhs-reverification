// External dependencies
const express = require('express');

const router = express.Router();

// V1 ROUTES

router.post('/v1/standalone/do-you-know-nhs', function (req, res) {
  var NHSnumber = req.session.data['knowNHSNumber']
  if (NHSnumber == 'yes'){
    res.redirect('/v1/standalone/what-is-your-dob')
  }else {
    res.redirect('/v1/standalone/what-is-your-name')
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

module.exports = router;
