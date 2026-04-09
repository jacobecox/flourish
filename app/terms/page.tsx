import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: false },
};

export default function TermsPage() {
  const effectiveDate = "April 9, 2025";

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-muted text-sm mb-10">Effective date: {effectiveDate}</p>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Flourish (&quot;the Service&quot;), you agree to be bound by these Terms of
            Service. If you do not agree, do not use the Service. Flourish is operated by Jacob Cox.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Use of the Service</h2>
          <p>
            You may use Flourish for personal, non-commercial purposes. You agree not to misuse the
            Service, attempt to gain unauthorized access to any part of it, or use it in any way that
            could damage, disable, or impair the platform or interfere with other users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Your Content</h2>
          <p>
            You retain ownership of all content you create in Flourish — including recipes, journal
            entries, and photos. By uploading content, you grant Flourish a limited license to store and
            display it solely for the purpose of providing the Service to you. We do not claim ownership
            over your content and will not use it for any other purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Shared Recipes</h2>
          <p>
            When you share a recipe via a public link, that recipe becomes viewable by anyone with the
            link. You are responsible for the content you choose to share. You can revoke sharing at any
            time from within the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. AI Features</h2>
          <p>
            Flourish uses AI to provide baking assistance. AI-generated responses are for informational
            purposes only and may not always be accurate. Do not rely on AI responses as professional
            advice. We are not responsible for outcomes resulting from following AI-generated suggestions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms, abuse the
            Service, or engage in any activity that we determine to be harmful. You may delete your
            account at any time from the account settings page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Service Availability</h2>
          <p>
            We strive to keep Flourish available at all times but cannot guarantee uninterrupted access.
            We reserve the right to modify, suspend, or discontinue the Service at any time with or
            without notice. We are not liable for any loss resulting from downtime or service changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind, express or implied. We make
            no guarantees regarding the accuracy, reliability, or completeness of any content or AI
            responses on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Flourish and its operator shall not be liable for
            any indirect, incidental, or consequential damages arising from your use of the Service,
            including data loss or unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Service after changes are
            posted constitutes acceptance of the updated Terms. We will update the effective date at the
            top of this page when changes are made.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact</h2>
          <p>
            If you have questions about these Terms, please reach out via the contact information on our
            website.
          </p>
        </section>
      </div>
    </div>
  );
}
