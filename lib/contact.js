// The one place the project's contact address is written. Every screen that shows
// or links to it (Terms, Privacy, anything added later) imports from here; no
// page, component, test or doc may contain an address or a hand-built mailto link.
// scripts/validate-contact.mjs (first step of `npm test`) fails if one does, or
// if this value changes by accident. To change the address: edit this line, then
// re-date Terms and Privacy ("Last updated") and update the guard's expected value.
export const CONTACT_EMAIL = "vococourses@gmail.com";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
