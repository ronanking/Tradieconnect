import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-slate-900">Privacy Policy</CardTitle>
            <p className="text-slate-600">Last updated: January 8, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>
              <p className="text-slate-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, post a job, or contact us.
                This may include:
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4">
                <li>Name, email address, and contact information</li>
                <li>Profile information and photos</li>
                <li>Job postings and service descriptions</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Messages and communications through our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-slate-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-slate-700 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Information Sharing</h2>
              <p className="text-slate-700 mb-4">
                We may share information about you in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4">
                <li>With other users when you use our services (such as your profile information)</li>
                <li>With vendors, consultants, and other service providers who need access to such information</li>
                <li>In response to a request for information if we believe disclosure is required by law</li>
                <li>To protect the rights, property, and safety of us, our users, or others</li>
                <li>In connection with any merger, sale of company assets, or acquisition</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Data Security</h2>
              <p className="text-slate-700 mb-4">
                We take reasonable measures to help protect information about you from loss, theft, misuse,
                unauthorized access, disclosure, alteration, and destruction. However, no internet or electronic
                storage system is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Data Retention</h2>
              <p className="text-slate-700 mb-4">
                We store the information we collect about you for as long as is necessary for the purpose(s)
                for which we originally collected it. We may retain certain information for legitimate business
                purposes or as required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Your Rights</h2>
              <p className="text-slate-700 mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4">
                <li>The right to access, update, or delete your information</li>
                <li>The right to rectification if your information is inaccurate</li>
                <li>The right to object to our processing of your information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent where we rely on your consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Cookies and Tracking</h2>
              <p className="text-slate-700 mb-4">
                We use cookies and similar tracking technologies to collect and use personal information about you.
                You can control cookies through your browser settings, though this may affect the functionality of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Third-Party Services</h2>
              <p className="text-slate-700 mb-4">
                Our service may contain links to third-party websites or services. We are not responsible for
                the privacy practices of these third parties. We encourage you to read their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-slate-700 mb-4">
                We may update this privacy policy from time to time. We will notify you of any changes by
                posting the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Contact Us</h2>
              <p className="text-slate-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us through our Contact page
                or email us with your privacy-related concerns.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}