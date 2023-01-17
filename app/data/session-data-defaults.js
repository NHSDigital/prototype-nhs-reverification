/*

Provide default values for user session data. These are automatically added
via the `autoStoreData` middleware. Values will only be added to the
session if a value doesn't already exist. This may be useful for testing
journeys where users are returning or logging in to an existing application.

*/

module.exports = {
  /*
  Insert end to end journey config here

  STATUS OPTIONS
    - design
    - research
    - complete
  SERVICE TYPE OPTIONS
    - identity
    - save
    - account
  */
  settings: [
    {
      v1_legal_terms: '/v1/legal/terms',
      v1_legal_cookies: '/v1/legal/cookies',
      v1_legal_privacy: '/v1/legal/privacy',
      v1_legal_a11y: '/v1/legal/accessibility'
    }
  ]
}
