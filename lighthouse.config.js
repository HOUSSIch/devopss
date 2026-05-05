export default {
  extends: 'lighthouse:recommended',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      downloadThroughputKbps: 10 * 1024,
      uploadThroughputKbps: 3 * 1024,
      cpuSlowdownMultiplier: 1,
    },
  },
  audits: {
    'first-contentful-paint': {
      options: {
        threshold: 3000,
      },
    },
    'largest-contentful-paint': {
      options: {
        threshold: 4000,
      },
    },
    'cumulative-layout-shift': {
      options: {
        threshold: 0.1,
      },
    },
  },
}
