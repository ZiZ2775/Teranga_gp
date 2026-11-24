// Teranga GP Configuration
// Load from environment variables or use defaults from .env.local
window.TGP_CONFIG = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://sb_publishable_66X6aQEEYT_2h3bp44emNA_OMlm-UpR.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiX3B1Ymxpc2hhYmxlXzY2WDZhUUVFWVRfMmgzYnA0NGVtTkEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMjQzNzI3MCwiZXhwIjoxODQwMjEzMjcwfQ.qJuMnR9xn9x0Z9x9Z9x9Z9x9Z9x9Z9x9Z9x9Z9x9Z9x'
  },
  
  // Netlify Configuration
  netlify: {
    siteUrl: import.meta.env.VITE_NETLIFY_SITE_URL || 'https://teranga-gp.netlify.app'
  },
  
  // Feature Flags
  features: {
    payments: false,
    analytics: true,
    darkMode: true
  },
  
  // UI Configuration
  ui: {
    featurePriceLabel: '1 000 FCFA',
    appName: 'Teranga GP',
    supportEmail: 'support@teranga-gp.com'
  }
};
