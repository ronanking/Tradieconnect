import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-slate-900">Terms of Service</CardTitle>
            <p className="text-slate-600">Last updated: January 8, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-700 mb-4">
                By accessing and using TradieConnect, you accept and agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Use License</h2>
              <p className="text-slate-700 mb-4">
                Permission is granted to temporarily use TradieConnect for personal, non-commercial transitory viewing only.
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">3. User Accounts</h2>
              <p className="text-slate-700 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times.
                You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Service Terms</h2>
              <p className="text-slate-700 mb-4">
                TradieConnect acts as a platform connecting customers with tradespeople. We do not directly provide trade services.
                All work agreements, payments, and service quality are matters between customers and tradies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Payment Terms</h2>
              <p className="text-slate-700 mb-4">
                Payment processing is handled through secure third-party providers. Platform fees may apply to certain transactions.
                All fees are clearly disclosed before any transaction is completed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Prohibited Uses</h2>
              <p className="text-slate-700 mb-4">You may not use our service:</p>
              <ul className="list-disc pl-6 text-slate-700 mb-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Disclaimer</h2>
              <p className="text-slate-700 mb-4">
                The information on this website is provided on an 'as is' basis. To the fullest extent permitted by law,
                this Company excludes all representations, warranties, conditions and terms related to our website and the use of this website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Limitations</h2>
              <p className="text-slate-700 mb-4">
                In no event shall TradieConnect or its suppliers be liable for any damages arising out of the use or inability to use
                the materials on TradieConnect's website, even if authorized representative has been notified of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Revisions</h2>
              <p className="text-slate-700 mb-4">
                The materials appearing on TradieConnect's website could include technical, typographical, or photographic errors.
                TradieConnect does not warrant that any of the materials on its website are accurate, complete, or current.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Contact Information</h2>
              <p className="text-slate-700 mb-4">
                If you have any questions about these Terms of Service, please contact us through our Contact page.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}