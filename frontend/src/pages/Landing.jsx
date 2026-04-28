import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 border-b bg-white/90 backdrop-blur-md border-slate-200 font-public-sans">
        <div className="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto w-full">
          <div className="text-xl font-bold tracking-tight text-slate-900">BankAi Enterprise</div>
          <nav className="hidden md:flex gap-8">
            <a className="text-slate-900 font-semibold border-b-2 border-slate-900 pb-1" href="#solutions">Solutions</a>
            <a className="text-slate-600 font-medium hover:text-slate-900 transition-colors" href="#infrastructure">Infrastructure</a>
            <a className="text-slate-600 font-medium hover:text-slate-900 transition-colors" href="#security">Security</a>
            <a className="text-slate-600 font-medium hover:text-slate-900 transition-colors" href="#governance">Governance</a>
            <a className="text-slate-600 font-medium hover:text-slate-900 transition-colors" href="#compliance">Compliance</a>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-600">EN/NP</span>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
              Request Demo
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-16 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <span className="font-label-caps text-label-caps text-secondary mb-4 block">SECURE ENTERPRISE AI</span>
              <h1 className="font-h1 text-h1 text-on-background mb-6 max-w-xl">
                Your Bank's Own Secure AI Document Intelligence Server
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-lg">
                A fully-integrated bare-metal appliance that brings sovereign LLM capabilities to your private network. No cloud, no leaks, absolute control.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-secondary text-on-secondary px-8 py-4 rounded font-semibold text-body-md transition-all hover:shadow-lg">
                  Request Enterprise Demo
                </button>
                <button
                  onClick={() => navigate('/features')}
                  className="border border-outline text-on-background px-8 py-4 rounded font-semibold text-body-md transition-all hover:bg-surface-container-low">
                  View Product Capabilities
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-surface-container-high rounded-full absolute -top-12 -right-12 w-96 h-96 blur-3xl opacity-30"></div>
              <img
                className="relative z-10 w-full rounded-xl shadow-2xl border border-slate-200"
                alt="Enterprise server in data center"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl0YXYCkQDomaeZuQkzAxIkvH6Ri-ViQ_RQ-pDURnOk73cXwKBy8dJiDQZFWwoYfRKUJJr4pLaGv8s1KunnV0WtV0YnQAb-aVnnoLGKwwtbTaQJ7dUjIvH6oXM8INHUPqs5bqmza-yZ54Zyun--PFNa91cKU5Hpc8reXgf2SBXS4xppUDfHVRN_8uvZuIPXfI9YgiJ2mtwMOPU456k2KHPlNLJIZZGQhJhM0dEeSpEDRbywa71uaH7eqHxKCG3_Hx24FOHdK5Bbg"
              />
            </div>
          </div>
        </section>

        {/* Trust Line */}
        <section className="bg-primary-container py-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-4xl">shield_lock</span>
              <h3 className="text-on-primary text-xl font-semibold">Built for banks that want AI without exposing data.</h3>
            </div>
            <p className="text-on-primary-container max-w-md text-sm">
              Isolated architecture with zero connection to core banking systems or public internet, ensuring total data sovereignty and regulatory compliance.
            </p>
          </div>
        </section>

        {/* Core Value Cards - Bento Grid */}
        <section className="py-16 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="font-label-caps text-label-caps text-secondary">ARCHITECTURAL PILLARS</span>
              <h2 className="font-h2 text-h2 mt-2">Engineered for Sovereign Intelligence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded border border-slate-200 md:col-span-2 border-l-4 border-l-secondary shadow-sm">
                <span className="material-symbols-outlined text-secondary mb-4 text-2xl">dns</span>
                <h4 className="font-h2 text-lg mb-3">Dedicated Bare-Metal Server</h4>
                <p className="text-on-surface-variant text-body-sm">Proprietary hardware configuration optimized specifically for large-scale financial document processing without virtualization overhead.</p>
              </div>
              <div className="bg-white p-8 rounded border border-slate-200 border-l-4 border-l-tertiary-fixed-dim shadow-sm">
                <span className="material-symbols-outlined text-tertiary-fixed-dim mb-4 text-2xl">terminal</span>
                <h4 className="font-h2 text-lg mb-3">Private LLM Runtime</h4>
                <p className="text-on-surface-variant text-body-sm">Host Gemma and other open-source models locally with hardware-accelerated inference.</p>
              </div>
              <div className="bg-white p-8 rounded border border-slate-200 border-l-4 border-l-secondary shadow-sm">
                <span className="material-symbols-outlined text-secondary mb-4 text-2xl">psychology</span>
                <h4 className="font-h2 text-lg mb-3">Secure Intelligence</h4>
                <p className="text-on-surface-variant text-body-sm">AI extraction tailored for financial terminologies, ledgers, and compliance docs.</p>
              </div>
              <div className="bg-white p-8 rounded border border-slate-200 md:col-span-2 border-l-4 border-l-on-background shadow-sm">
                <span className="material-symbols-outlined text-on-background mb-4 text-2xl">history_edu</span>
                <h4 className="font-h2 text-lg mb-3">Audit-Ready AI</h4>
                <p className="text-on-surface-variant text-body-sm">Every extraction is traceable back to the source document with exact page coordinates and confidence scores for absolute transparency.</p>
              </div>
              <div className="bg-white p-8 rounded border border-slate-200 border-l-4 border-l-tertiary-fixed-dim shadow-sm">
                <span className="material-symbols-outlined text-tertiary-fixed-dim mb-4 text-2xl">verified_user</span>
                <h4 className="font-h2 text-lg mb-3">Role Governance</h4>
                <p className="text-on-surface-variant text-body-sm">Granular control over who can upload, query, and manage knowledge libraries.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="font-h2 text-h2">The Intelligence Lifecycle</h2>
              <div className="h-1 w-20 bg-secondary mt-4"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
              <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 border-t border-dashed border-slate-300 -z-0"></div>
              {['Upload', 'Process', 'Ask', 'Retrieve', 'Generate', 'Audit'].map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center font-bold mb-4">
                    {i + 1}
                  </div>
                  <h5 className="font-semibold text-sm mb-2">{step}</h5>
                  <p className="text-xs text-on-surface-variant">
                    {[
                      'Batch ingest secure PDFs & scans',
                      'OCR & Layout analysis',
                      'Conversational queries',
                      'Instant context finding',
                      'Summaries & extractions',
                      'Verify every single claim'
                    ][i]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ChatGPT-Like Interaction */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-slate-400 text-xs font-mono">bankai-secure-terminal</span>
              </div>
              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-lg text-body-sm">
                    Summarize the liability section of the Q3 Audit Report and compare it to last year's figures.
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded bg-primary-container text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-sm text-body-sm">
                      Based on <strong>Q3_Audit_2024.pdf</strong> and <strong>Annual_Report_2023.pdf</strong>, here is the comparison:
                      <table className="w-full mt-4 border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="p-2 text-left font-semibold border-b border-slate-200">Category</th>
                            <th className="p-2 text-right font-semibold border-b border-slate-200">2023</th>
                            <th className="p-2 text-right font-semibold border-b border-slate-200">2024 (Q3)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border-b border-slate-50">Operational Liability</td>
                            <td className="p-2 text-right border-b border-slate-50">$4.2M</td>
                            <td className="p-2 text-right border-b border-slate-50">$3.8M</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-b border-slate-50">Contingent Risk</td>
                            <td className="p-2 text-right border-b border-slate-50">$1.1M</td>
                            <td className="p-2 text-right border-b border-slate-50">$1.4M</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-semibold text-secondary">SOURCE: PG 42</span>
                      <span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-semibold text-secondary">CONFIDENCE: 98.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="font-label-caps text-label-caps text-secondary mb-4 block">CONVERSATIONAL INTELLIGENCE</span>
              <h2 className="font-h2 text-h2 mb-6">Ask Anything. Get Verified Answers.</h2>
              <p className="text-on-surface-variant mb-6">Transform complex PDF tables and multi-page legal documents into instant conversational insights. BankAi understands financial context, not just keywords.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim">check_circle</span>
                  <span className="text-body-md font-medium">Automatic Table Reconstruction</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim">check_circle</span>
                  <span className="text-body-md font-medium">Cross-Document Synthesis</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim">check_circle</span>
                  <span className="text-body-md font-medium">Bilingual Support (English & Nepali)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Vision Intelligence */}
        <section className="py-16 px-6 bg-primary-container text-white">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="font-h2 text-h2 mb-8">Vision-Enabled Intelligence</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: 'visibility', title: 'Hybrid OCR Engine', desc: '99.9% accuracy on handwritten notes, blurry scans, and complex layouts.' },
                { icon: 'draft', title: 'Multi-Format Native', desc: 'Direct ingestion of PDF, DOCX, XLSX, TXT, and scanned images.' },
                { icon: 'architecture', title: 'Layout Awareness', desc: 'Understands headers, footers, charts, and nested tables for accurate extractions.' }
              ].map((item) => (
                <div key={item.title} className="p-6 bg-white/5 rounded border border-white/10">
                  <span className="material-symbols-outlined text-3xl mb-3">{item.icon}</span>
                  <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                  <p className="text-slate-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="py-16 px-6 bg-surface-container-high">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="font-h2 text-h2 mb-8">Security by Design</h2>
                <div className="space-y-6">
                  {[
                    { icon: 'masks', title: 'PII Masking', desc: 'Automated identification and redaction of customer sensitive data before inference.' },
                    { icon: 'manage_accounts', title: 'Role-Based Access (RBAC)', desc: 'Active Directory integration with strictly defined document access permissions.' },
                    { icon: 'rule', title: 'Audit Logs', desc: 'Immutable logs of every query, upload, and system modification for regulatory review.' }
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <span className="material-symbols-outlined text-secondary">{item.icon}</span>
                      <div>
                        <h5 className="font-bold">{item.title}</h5>
                        <p className="text-sm text-on-surface-variant">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-h2 text-h2 mb-6">Enterprise Governance</h3>
                <p className="text-on-surface-variant mb-8">Maintain total control over your institutional knowledge. Manage libraries, set retention policies, and monitor system health from a single dashboard.</p>
                <div className="grid grid-cols-2 gap-4">
                  {['Super Admin', 'Compliance', 'Analyst', 'Reviewer'].map((role) => (
                    <div key={role} className="bg-white p-4 border border-slate-200 rounded text-center">
                      <p className="text-xs font-bold text-outline">ROLES</p>
                      <p className="text-lg font-bold">{role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Infrastructure Specs */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-h2 text-h2">Hardware & Model Specs</h2>
              <p className="text-on-surface-variant">Enterprise-grade performance without compromise.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'COMPUTE', value: 'NVIDIA L40S', desc: 'Next-gen AI processing unit' },
                { label: 'MEMORY', value: '128GB DDR5', desc: 'High-speed system RAM' },
                { label: 'STORAGE', value: '4TB NVMe Gen5', desc: 'Enterprise-grade SSD arrays' },
                { label: 'MODEL', value: 'Bank\'s Own Finetuned LLM', desc: 'Quantized local inference' }
              ].map((spec) => (
                <div key={spec.label} className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <p className="font-label-caps text-secondary mb-2">{spec.label}</p>
                  <p className="text-xl font-bold">{spec.value}</p>
                  <p className="text-xs text-on-surface-variant">{spec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Onboarding Steps */}
        <section className="py-16 px-6 bg-surface-container-lowest">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-h2 text-h2 text-center mb-12">Institutional Setup</h2>
            <div className="space-y-12">
              {[
                { num: '01', title: 'Physical Provisioning', desc: 'BankAi Server is delivered as a pre-configured rack-mount appliance to your data center.' },
                { num: '02', title: 'Network Isolation', desc: 'Your IT team configures a secure air-gapped or restricted intranet segment for the server.' },
                { num: '03', title: 'Library Mapping', desc: 'Ingest historical document repositories to build your institution\'s private AI knowledge base.' }
              ].map((step) => (
                <div key={step.num} className="flex gap-8 items-start">
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center bg-secondary text-on-secondary rounded-full font-bold text-xl">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-h2 text-lg mb-2">{step.title}</h4>
                    <p className="text-on-surface-variant">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-6 relative overflow-hidden bg-primary-container text-white">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h2 className="font-h1 text-h1 mb-6">Give Your Bank Its Own AI Document Intelligence Server</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Empower your analysts with secure, private, and audit-ready intelligence. Schedule a consultation with our enterprise architects.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button className="bg-tertiary-fixed-dim text-on-tertiary-fixed px-10 py-5 rounded font-bold text-lg hover:scale-105 transition-transform">
                Request Enterprise Demo
              </button>
              <button className="border border-white/20 px-10 py-5 rounded font-bold text-lg hover:bg-white/10 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at top right, #316bf3, transparent), radial-gradient(circle at bottom left, #4edea3, transparent)'
          }}></div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t mt-12 bg-slate-50 border-slate-200 text-sm font-public-sans">
        <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 max-w-7xl mx-auto gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-lg font-bold text-slate-900">BankAi Enterprise</span>
            <p className="text-slate-500 mt-2">© 2026 BankAi Enterprise Server. Secure Document Intelligence for Financial Institutions.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-8">
            <a className="text-slate-500 hover:text-slate-900 transition-colors" href="#">Privacy Policy</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors" href="#">Terms of Service</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors" href="#">Security Whitepaper</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors" href="#">API Docs</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors" href="#">Contact Support</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
