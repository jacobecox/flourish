import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPage() {
  const effectiveDate = "April 9, 2025";

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-muted text-sm mb-10">Effective date: {effectiveDate}</p>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Overview</h2>
          <p>
            Flourish is a personal sourdough baking companion. This Privacy Policy explains what data we
            collect, how we use it, and your rights regarding that data. We keep this simple because we
            believe you deserve to understand exactly what happens with your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account information:</strong> Your email address and display name when you register.</li>
            <li><strong>Content you create:</strong> Recipes, journal entries, bake notes, starter logs, and photos you upload.</li>
            <li><strong>Usage data:</strong> Basic server logs including IP address and request timestamps, used for security and debugging.</li>
            <li><strong>AI interactions:</strong> Messages you send to the AI assistant are processed to generate responses. We do not store your chat history beyond your current session.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide and operate the Service</li>
            <li>To power the AI assistant with context from your recipes and journal</li>
            <li>To send transactional emails (e.g. password reset) — no marketing emails</li>
            <li>To diagnose errors and improve the platform</li>
          </ul>
          <p className="mt-3">We do not sell your data. We do not use your content for advertising.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Services</h2>
          <p className="mb-3">
            Flourish uses the following third-party services to operate. Each has its own privacy policy:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Anthropic (Claude):</strong> Powers the AI baking assistant. Your messages and recipe context are sent to Anthropic to generate responses.</li>
            <li><strong>Voyage AI:</strong> Generates vector embeddings from your recipes and journal entries to enable AI search and context retrieval.</li>
            <li><strong>FusionAuth:</strong> Handles authentication, including email/password login and Google OAuth.</li>
            <li><strong>Cloudflare R2:</strong> Stores photos you upload to recipes and journal entries.</li>
            <li><strong>Resend:</strong> Sends transactional emails such as password reset links.</li>
            <li><strong>Control Plane:</strong> Hosts the application infrastructure.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
          <p>
            Your data is retained as long as your account is active. When you delete your account, your
            personal information and content will be removed from our systems within a reasonable
            timeframe. Some data may remain in backups for a limited period.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
          <p className="mb-3">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Access the data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Export your content at any time from within the app</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, contact us via the information below.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookies & Local Storage</h2>
          <p>
            Flourish uses a single session cookie to keep you logged in. We use local storage for
            theme preference only. We do not use tracking cookies or third-party analytics cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Children&apos;s Privacy</h2>
          <p>
            Flourish is not directed at children under 13. We do not knowingly collect personal
            information from children. If you believe a child has created an account, please contact us
            and we will remove the account promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will update the effective date at
            the top of this page when changes are made. Continued use of the Service after updates
            constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact</h2>
          <p>
            If you have questions about this Privacy Policy or want to exercise your data rights, please
            reach out via the contact information on our website.
          </p>
        </section>
      </div>
    </div>
  );
}
