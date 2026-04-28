import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded">
              <span className="material-symbols-outlined text-white text-[18px]">account_balance</span>
            </div>
            <span className="text-xl font-bold font-public-sans text-slate-900">BankAi</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-primary text-white rounded font-semibold hover:opacity-90 transition-opacity">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-primary-container via-surface to-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold font-public-sans text-slate-900 mb-6 leading-tight">
            Secure Financial <br className="hidden sm:block" />
            Document Intelligence
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered analysis of your bank's private documents. Fully air-gapped from live banking systems.
            Every query is encrypted, logged, and auditable.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-primary text-white rounded font-semibold hover:opacity-90 transition-opacity shadow-lg">
              Start Demo
            </button>
            <button className="px-8 py-3 border-2 border-primary text-primary rounded font-semibold hover:bg-primary hover:text-white transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-6 bg-white border-t border-b border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: 'lock', label: 'End-to-End Encrypted', value: '256-bit' },
            { icon: 'verified_user', label: 'SOC2 Type II', value: 'Compliant' },
            { icon: 'policy', label: 'PII Masked', value: '100%' },
            { icon: 'history_edu', label: 'Fully Auditable', value: 'Yes' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <span className="material-symbols-outlined text-primary text-4xl flex justify-center mb-3">
                {item.icon}
              </span>
              <p className="text-sm text-slate-500 mb-1">{item.label}</p>
              <p className="text-lg font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold font-public-sans text-slate-900 mb-4 text-center">
            Powerful Capabilities
          </h2>
          <p className="text-slate-600 text-center mb-16 max-w-2xl mx-auto">
            Analyze, extract, and gain insights from financial documents with enterprise-grade AI
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                icon: 'monitoring',
                title: 'Financial Report Analysis',
                desc: 'Extract P&L metrics, variance analysis, and KPIs from quarterly filings and annual reports.',
              },
              {
                icon: 'policy',
                title: 'Compliance Validation',
                desc: 'Validate documents against NRB directives and internal governance frameworks automatically.',
              },
              {
                icon: 'contract',
                title: 'Loan Agreement Audit',
                desc: 'Extract key dates, interest rates, and clauses from loan agreements with precision.',
              },
              {
                icon: 'rule',
                title: 'Policy Comparison',
                desc: 'Compare uploaded policies against approved internal standards in seconds.',
              },
              {
                icon: 'search',
                title: 'Multi-Document Search',
                desc: 'Semantic search across all uploaded documents with context-aware results.',
              },
              {
                icon: 'assessment',
                title: 'Risk Assessment',
                desc: 'Identify potential risks and anomalies in financial documents automatically.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-8 bg-white border border-slate-200 rounded-lg hover:shadow-lg hover:border-secondary transition-all group">
                <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-secondary transition-colors">
                    {item.icon}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold font-public-sans text-slate-900 mb-16 text-center">
            Enterprise Features
          </h2>

          <div className="space-y-16">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Session-Based Analysis
                </h3>
                <p className="text-slate-600 text-lg mb-4 leading-relaxed">
                  Organize your analysis into sessions. Upload multiple documents, ask questions,
                  and get AI-powered insights with full source attribution.
                </p>
                <ul className="space-y-3">
                  {['Multi-document context', 'Source attribution', 'Session history', 'Collaboration ready'].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                <div className="space-y-4">
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-primary/30">folder_open</span>
                  </div>
                  <p className="text-sm text-slate-500 text-center">Session Dashboard Preview</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm order-2 md:order-1">
                <div className="space-y-4">
                  <div className="h-40 bg-gradient-to-br from-secondary/10 to-primary/10 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-secondary/30">security</span>
                  </div>
                  <p className="text-sm text-slate-500 text-center">Military-Grade Security</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Bank-Grade Security
                </h3>
                <p className="text-slate-600 text-lg mb-4 leading-relaxed">
                  Your data never touches public networks. Every interaction is encrypted,
                  logged, and auditable for compliance.
                </p>
                <ul className="space-y-3">
                  {['Air-gapped architecture', 'End-to-end encryption', 'Audit logging', 'Zero external access'].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-[20px]">shield</span>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Bilingual Interface
                </h3>
                <p className="text-slate-600 text-lg mb-4 leading-relaxed">
                  Switch seamlessly between English and नेपाली. Query documents in either language
                  and get responses in your preferred language.
                </p>
                <ul className="space-y-3">
                  {['English & Nepali', 'Language-aware AI', 'Cultural context', 'Easy switching'].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">translate</span>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                <div className="space-y-4">
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-tertiary/10 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-primary/30">language</span>
                  </div>
                  <p className="text-sm text-slate-500 text-center">Multi-Language Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold font-public-sans text-slate-900 mb-4 text-center">
            Perfect For
          </h2>
          <p className="text-slate-600 text-center mb-16 max-w-2xl mx-auto">
            Any organization that needs to analyze and extract insights from financial documents securely
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Banks & Financial Institutions', icon: 'account_balance_wallet' },
              { title: 'Regulatory & Compliance Teams', icon: 'gavel' },
              { title: 'Investment Management', icon: 'trending_up' },
              { title: 'Internal Audit Teams', icon: 'assessment' },
              { title: 'Risk Management', icon: 'warning' },
              { title: 'Credit Analysis', icon: 'credit_score' },
            ].map((item) => (
              <div key={item.title} className="p-6 bg-white border border-slate-200 rounded-lg text-center hover:border-primary hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-primary text-4xl flex justify-center mb-3">
                  {item.icon}
                </span>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary-container text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold font-public-sans mb-6">
            Ready to Transform Your Document Analysis?
          </h2>
          <p className="text-xl mb-10 text-on-primary-container opacity-90">
            Experience the power of AI-driven financial document intelligence with enterprise-grade security.
            Deploy in the cloud for instant access, or on-premises for complete control.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white text-primary rounded font-bold text-lg hover:opacity-90 transition-opacity shadow-lg">
              Launch Demo Now
            </button>
            <button
              className="px-10 py-4 border-2 border-white text-white rounded font-bold text-lg hover:bg-white hover:text-primary transition-colors">
              Request Enterprise Quote
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-primary flex items-center justify-center rounded">
                  <span className="material-symbols-outlined text-white text-[18px]">account_balance</span>
                </div>
                <span className="font-bold font-public-sans text-slate-900">BankAi</span>
              </div>
              <p className="text-sm text-slate-600">Enterprise Intelligence for Financial Documents</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Security</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
                <li><a href="#" className="hover:text-primary">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
            <p>© 2026 BankAi. All rights reserved. | Authorized access only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
