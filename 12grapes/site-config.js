/*
 * 12Grapes publishing configuration
 *
 * Leave values blank while the site is in review. The forms will prepare a
 * copyable/downloadable brief and will never claim it was sent.
 *
 * Before publishing, add verified contact details and either:
 *   1. a form endpoint that accepts FormData and returns a 2xx response; or
 *   2. an email address for the mailto fallback.
 */
window.TWELVE_GRAPES_CONFIG = Object.freeze({
  serviceArea: "",
  phoneDisplay: "",
  phoneHref: "",
  clientEmail: "",
  candidateEmail: "",
  clientFormEndpoint: "",
  candidateFormEndpoint: ""
});
