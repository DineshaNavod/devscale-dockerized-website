/**
 * DevScaleSolution — site configuration
 * ------------------------------------------------------------
 * Everything that is business-specific and unverified lives here,
 * so nothing has to be invented in the HTML.
 *
 * Do NOT put API secrets in this file. It is public frontend code.
 */
window.DEVSCALE_CONFIG = {
  // Hero availability pill. Set show:false to hide it, or edit the text.
  availability: {
    show: true,
    text: "Open to new projects"
  },

  contact: {
    // Contact form endpoint (must be https). Example with Formspree:
    //   "https://formspree.io/f/your-form-id"
    // Leave empty to keep the form in DEMO MODE (validates, but sends nothing).
    formEndpoint: "",

    // Public business email. Enables a "mailto:" fallback and the direct-contact CTA.
    // Leave empty until you have a verified address.
    email: "",

    // Optional custom direct-contact CTA (e.g. a booking page or WhatsApp link).
    // If href is empty and email is set, the CTA uses mailto:<email>.
    directCta: {
      label: "Email us directly",
      href: ""
    },

    // Minimum seconds between page load and submit (basic bot deterrent).
    minSubmitSeconds: 3
  },

  // Social links render in the footer ONLY when listed here.
  // Example: { label: "LinkedIn", href: "https://www.linkedin.com/company/your-page" }
  social: []
};
