export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px', fontFamily: '-apple-system, sans-serif', color: '#1A1A1A', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Privacy Policy</h1>
      <p style={{ color: 'rgba(0,0,0,0.5)', marginBottom: 20 }}>Last updated: July 2026</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>What we collect</h2>
      <p>Cortilow collects the answers you provide during the cortisol assessment quiz (sleep habits, stress level, exercise frequency, diet, hydration, and nature exposure). This data is used solely to calculate your Cortisol Score and generate your personalized plan.</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Photos</h2>
      <p>Selfies taken during the assessment are processed locally on your device and are never uploaded to our servers. Face Log photos are stored locally on your device only.</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Email</h2>
      <p>If you provide your email address, it is used only for account authentication and to send you your cortisol report. We do not sell or share your email with third parties.</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Payments</h2>
      <p>Payments are processed by Apple through the App Store. We do not collect or store any payment information (credit card numbers, billing address, etc.).</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Data storage</h2>
      <p>Your quiz responses and score are stored securely using Supabase (cloud database). Your daily mission progress, streak data, and photos are stored locally on your device.</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Data deletion</h2>
      <p>You can request deletion of all your data at any time by contacting us at the email below. We will delete your data within 30 days of your request.</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Third parties</h2>
      <p>We use the following third-party services: Supabase (database), Vercel (hosting), RevenueCat (subscription management), Apple (payments). Each has its own privacy policy.</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Contact</h2>
      <p>For any privacy-related questions, contact us at: privacy@cortilow.com</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Changes</h2>
      <p>We may update this policy from time to time. Any changes will be posted on this page.</p>
    </main>
  )
}
