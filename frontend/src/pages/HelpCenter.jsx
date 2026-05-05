import { useMemo, useState } from 'react';

const CATEGORIES = [
  {
    icon: 'rocket_launch',
    title: 'Getting Started',
    description: 'Account setup, first document uploads, session controls, and common workspace defaults.',
    articles: 12,
    tags: ['Onboarding', 'Uploads', 'Workspace'],
  },
  {
    icon: 'verified_user',
    title: 'Security & Privacy',
    description: 'PII masking, encryption posture, audit retention, access reviews, and data residency controls.',
    articles: 18,
    tags: ['PII', 'Encryption', 'Audit Logs', 'MFA'],
    wide: true,
  },
  {
    icon: 'psychology',
    title: 'Document Analysis Tips',
    description: 'Improve OCR quality, table extraction, citation review, and low-confidence evidence handling.',
    articles: 9,
    tags: ['OCR Guide', 'Table Extraction', 'Citations'],
    wide: true,
  },
  {
    icon: 'hub',
    title: 'Integrations',
    description: 'Connect LipiCore with core banking systems, data warehouses, SSO, and webhook consumers.',
    articles: 7,
    tags: ['API', 'SSO', 'Webhooks'],
  },
];

const ARTICLES = [
  { icon: 'description', title: 'Configuring Webhooks for Real-time Audits', meta: 'Updated 2 hours ago - 5 min read' },
  { icon: 'security', title: 'Updating IP Whitelists for Enterprise Firewalls', meta: 'Updated yesterday - 3 min read' },
  { icon: 'translate', title: 'Nepali Language Extraction: Best Practices', meta: 'Updated 3 days ago - 8 min read' },
  { icon: 'rule', title: 'Reviewing Low-confidence Answers Before Export', meta: 'Updated 5 days ago - 6 min read' },
];

export default function HelpCenter() {
  const [query, setQuery] = useState('');

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ARTICLES;
    return ARTICLES.filter(article => article.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="p-xl max-w-container-max mx-auto">
      <section className="mb-xl bg-primary-container rounded-lg p-xl text-white relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/3 opacity-30 bg-[radial-gradient(circle_at_center,#316bf3_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-3xl">
          <p className="font-label-caps text-label-caps text-on-primary-container uppercase tracking-widest mb-md">
            LipiCore Support Portal
          </p>
          <h1 className="font-h1 text-h1 mb-md">Help Center</h1>
          <p className="font-body-lg text-body-lg text-slate-300 mb-lg">
            Professional guidance for document intelligence, compliance workflows, and enterprise security operations.
          </p>
          <div className="relative max-w-xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              className="w-full bg-white text-on-surface pl-12 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-secondary text-body-sm"
              placeholder="Search knowledge base..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-gutter mb-xl">
        {CATEGORIES.map(category => (
          <article
            key={category.title}
            className={`${category.wide ? 'col-span-12 lg:col-span-8' : 'col-span-12 lg:col-span-4'} bg-white border border-slate-200 p-lg rounded-lg hover:border-secondary transition-colors`}
          >
            <div className="flex items-start justify-between gap-md">
              <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-lg flex-shrink-0">
                <span className="material-symbols-outlined text-secondary">{category.icon}</span>
              </div>
              <span className="text-xs font-bold text-secondary bg-blue-50 px-2 py-1 rounded">
                {category.articles} articles
              </span>
            </div>
            <h2 className="font-h2 text-h2 text-on-surface mt-lg mb-sm">{category.title}</h2>
            <p className="text-body-sm text-on-surface-variant mb-lg max-w-2xl">{category.description}</p>
            <div className="flex flex-wrap gap-sm">
              {category.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-surface-container text-secondary text-xs font-bold rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8">
          <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest mb-md">
            Recently Updated Articles
          </h3>
          <div className="space-y-sm">
            {filteredArticles.map(article => (
              <button
                key={article.title}
                className="w-full flex items-center justify-between p-md bg-white border border-slate-200 hover:shadow-card rounded-lg text-left transition-all"
              >
                <div className="flex items-center gap-md min-w-0">
                  <span className="material-symbols-outlined text-slate-400 flex-shrink-0">{article.icon}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface truncate">{article.title}</p>
                    <p className="text-xs text-slate-400">{article.meta}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 flex-shrink-0">chevron_right</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="bg-surface-container border-l-4 border-secondary p-lg rounded-lg sticky top-24">
            <h3 className="font-h2 text-h2 text-on-surface mb-sm">Still need help?</h3>
            <p className="text-body-sm text-on-surface-variant mb-lg">
              Enterprise support engineers are available for critical audit, deployment, and security incidents.
            </p>
            <div className="space-y-md">
              {[
                ['chat_bubble_outline', 'Live Chat', 'Wait time: ~2 mins'],
                ['mail', 'Email Support', 'enterprise@lipicore.com'],
                ['call', 'Priority Phone', '+1 (800) BANK-AI-1'],
              ].map(([icon, label, detail]) => (
                <div key={label} className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-secondary">{icon}</span>
                  <div>
                    <p className="font-bold text-body-sm text-on-surface">{label}</p>
                    <p className="text-xs text-slate-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-lg bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
              Contact Support
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
