// External dependencies
const express = require('express');

const router = express.Router();



// Add your routes here - above the module.exports line

//P0 V1 //

router.post('/v1/P0/stages-account-created', function (req,res) {
res.redirect('/v1/P5/know-your-nhs-number')
})

router.post('/app/start', function (req, res) {
  var Research = req.session.data['testing']
  if (Research == 'dayOne'){
    res.redirect('/v1/P0/enter-email?verificationLevel=p9')
  }else if (Research == 'dayTwo'){
  res.redirect('/v1/P0/enter-email?verificationLevel=p0&p5=fail')
  }else{
  res.redirect('/v1/P0/enter-email')
}
})

//P5 V1 //
//Routing for NHS number
router.post('/v1/P5/know-your-nhs-number', function (req, res) {
  var NHSnumber = req.session.data['knowNHSNumber']
  if (NHSnumber == 'yes'){
    res.redirect('enter-dob?nhsno=true')
  }else {
    res.redirect('enter-name')
  }
})

// split routing for NHS number vs full name journey
router.post('/v1/P5/enter-dob', function (req, res){
  var NHSnumber = req.session.data['NHSNumber']
  //parameter for NHS number route
  if (NHSnumber == 'true'){
    res.redirect('enter-postcode?nhsno=true')
  }else{
    res.redirect('enter-postcode')
  }
})
/*
router.post('/v1/P5/enter-postcode', function (req, res){
  var NHSnumber = req.session.data['NHSNumber']
    //parameter for NHS number route
  if (NHSnumber == 'true'){
    res.redirect('auth?nhsno=true')
  }else{
    res.redirect('auth')
  }
})
*/
// p5 fail journeys
router.post('/v1/p5/enter-postcode', function (req, res){
  var P5Fail = req.session.data['p5fail']
  if (P5Fail == 'true'){
  res.redirect('auth-fail')
}else{
  res.redirect('auth')
}
})

router.post('/v1/P5/errors/cannot-match', function (req, res){
  var failOptions = req.session.data['cannotMatchRecord']
  if (failOptions == 'useNHSno'){
    res.redirect('/v1/P5/know-your-nhs-number?p5=fail')
  }else if (failOptions == 'PYI'){
    res.redirect('confirm-details-pyi')
  }else if (failOptions == 'useFullName'){
    res.redirect('/v1/P5/enter-name?p5=fail')
  }else{
    res.redirect('check-details')
  }
})

//Avoids throwing us down the routing above
router.post('/v1/P5/enter-name', function (req, res){
  res.redirect('/v1/P5/enter-dob')
})

// Split routing from the P5 confirm details page
router.post('/v1/P5/confirm-details', function (req, res){
  var confirmDetails = req.session.data['checkDetails']
  if (confirmDetails == 'yes'){
    res.redirect('/v1/P5/stages-match-record')
  }else if (confirmDetails == 'no'){
    res.redirect('errors/wrong-details')
  }else{
    res.redirect('errors/partial-details-match')
  }
})


//// IDVM routing ////////

router.post('/v1/P9/IDVM/use-gp-checks', function (req, res){


    res.redirect('auth-back-to-client')

})

///// PYI PHOTO ID ROUTING ////////


router.post('/v1/P9/PYI/triage/photo-id-question-answer', function (req, res) {

    // Make a variable and give it the value from the 'photo-id-question' page
    var id = req.session.data['id']

    // Check if the variable matches a condition below
    if (id == "yes") {
      // Send user to start of steps
      res.redirect('/v1/P9/PYI/triage/device-checks')
    } else if (id == "yes-ish") {
      res.redirect('/v1/P9/PYI/triage/comeback')
    } else if (id == "no") {
      res.redirect('/v1/P9/POL/details')
    }else if (id == 'yes-fail'){
      res.redirect('/v1/P9/PYI/triage/device-checks?p5=fail')
    }else if (id == 'yes-ish-fail'){
      res.redirect('/v1/P9/PYI/triage/comeback?p5=fail')
    }else if (id == 'yes-ish-fail'){
      res.redirect('/v1/P9/POL/details?p5=fail')
    } else {
      res.redirect('/v1/P9/PYI/triage/photo-id-question?error=nothing-selected')
    }
  })


///// VIDEO SELFIE TRIAGE ROUTING ////////


router.post('/v1/P9/PYI/record-face/manual/triage-answer', function (req, res) {


  var name = req.session.data['how-to-record']
   // Check whether the variable matches a condition
  if (name == "Say"){
    res.redirect('/v1/P9/PYI/record-face/manual/mobile/say')
  } else if (name == "Write") {
    res.redirect('/v1/P9/PYI/record-face/manual/mobile/write')
  } else if (name == "Sign") {
    res.redirect('/v1/P9/PYI/record-face/manual/mobile/sign')
  } else {
    res.redirect('/v1/P9/PYI/record-face/manual/triage?error=nothing-selected')
  }
 })



///// P9> POL PROVE ID WITHOUT PHOTO ROUTING ////////


router.post('/v1/P9/POL/details-answer', function (req, res) {


  var name = req.session.data['details']
   // Check whether the variable matches a condition
  if (name == "Yes"){
    res.redirect('/v1/P9/POL/details-2')
  } else if (name == "No") {
    res.redirect('/v1/P9/POL/offline-create')
  } else if (name == "I don’t know") {
    res.redirect('/v1/P9/POL/offline-dunno')
  } else {
    res.redirect('/v1/P9/POL/details?error=nothing-selected')
  }
 })

 router.post('/v1/one-off/do-you-know-nhss', function (req, res) {


   var name = req.session.data['details']
    // Check whether the variable matches a condition
   if (name == "Yes"){
     res.redirect('/v1/one-off/what-is-your-nhs')
   } else if (name == "No") {
     res.redirect('/v1/one-off/what-is-your-postcode')
   }
  })




///// P9 > POL > DETAILS 2////////


router.post('/v1/P9/POL/details-2-answer', function (req, res) {


  var name = req.session.data['details-2']
   // Check whether the variable matches a condition
  if (name == "Yes"){
    res.redirect('/v1/P9/POL/linkage-key')
  } else if (name == "No") {
    res.redirect('/v1/P9/POL/offline-retrieve')
  } else if (name == "dontKnow") {
    res.redirect('/v1/P9/POL/offline-dunno')
  } else {
    res.redirect('/v1/P9/POL/details-2?error=nothing-selected')
  }
 })

 ///// PYI > PHOTO ID TYPE////////


      // if user is on desktop, don't show them the option of how to send
      router.post('/v1/P9/PYI/photo-id/photo-id-type-answer', function (req, res) {
        var name = req.session.data['idType']
        var device = req.session.data['device']

         // Check whether the variable matches a condition
        if (name == "passport"){
          res.redirect('/v1/P9/PYI/photo-id/how-to-send')
        } else if (name == "UK-driving-licence") {
          res.redirect('/v1/P9/PYI/photo-id/how-to-send')
        } else if (name == "EU-driving-licence") {
          res.redirect('/v1/P9/PYI/photo-id/how-to-send')
        } else if (name == "European-national-identity-card") {
          res.redirect('/v1/P9/PYI/photo-id/how-to-send')
        } else if (name == "UK-residence-card") {
          res.redirect('/v1/P9/PYI/photo-id/how-to-send')
        } else {
          res.redirect('/v1/P9/PYI/photo-id/photo-id-type?error=nothing-selected')
        }
       }
       )



 //// PYI > how to send ////////


router.post('/v1/P9/PYI/photo-id/how-to-send-answer', function (req, res) {

  var how = req.session.data['how']
   // Check whether the variable matches a condition
  if (how == "upload"){
    res.redirect('/v1/P9/PYI/photo-id/camera?how=upload')
  } else if (how == "take") {
    res.redirect('/v1/P9/PYI/photo-id/camera?how=take')
  } else {
    res.redirect('/v1/P9/PYI/photo-id/how-to-send?error=nothing-selected')
  }
 })

 /////// General routing ///////////

  // Dev Mode
function devModeRoute(req, res, next) {
  if (!req.session.data['devMode']) {
    console.log('no data found');
    var devMode = req.query.devMode;
    if (devMode === 'true') {
      console.log('devmode detected');
      req.session.data['devMode'] = 'true'
      console.log('local storage updated');
    } else {
      console.log('devmode not detected');
    }
  } else {
    console.log('data found and set to ' + req.session.data['devMode'])
  }
  next()
}

router.get("/*", devModeRoute);
router.get("/", devModeRoute);

// Clear all session data
router.get('/clear-data', (req, res) => {
  req.session.data = {}
  res.redirect('/')
})

// Clear all session data in research
router.get('/clear-data-research', (req, res) => {
  req.session.data = {}
  res.redirect('/research/060622')
})

router.post('/v1/P9/PYI/demographics/nhs-number-automated-answer', function (req, res) {


  var name = req.session.data['contact']
   // Check whether the variable matches a condition
  if (name == "yes"){
    res.redirect('/v1/P9/PYI/demographics/demographics-dob')
  } else if (name == "no") {
    res.redirect('/v1/P9/PYI/demographics/demographics-name')
  } else {
    res.redirect('/v1/P9/PYI/demographics/nhs-number-automated?error=nothing-selected')
  }
 })



      module.exports = router;
