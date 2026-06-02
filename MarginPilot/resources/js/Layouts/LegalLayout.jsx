import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

export default function LegalLayout({ title, lastUpdated, children }) {
    return (
        <PublicLayout>
            <Head title={`${title} — Margexa`} />

            <section className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-violet-600">
                            Légal
                        </div>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {title}
                        </h1>
                        {lastUpdated && (
                            <p className="mt-2 text-sm text-slate-500">
                                Dernière mise à jour : {lastUpdated}
                            </p>
                        )}
                    </div>

                    {/* Content card */}
                    <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                        <div className="prose prose-slate max-w-none
                            prose-headings:font-semibold prose-headings:text-slate-900
                            prose-h2:mt-10 prose-h2:text-xl prose-h2:border-t prose-h2:border-slate-100 prose-h2:pt-8
                            prose-h3:mt-6 prose-h3:text-base
                            prose-p:text-slate-600 prose-p:leading-7
                            prose-li:text-slate-600 prose-li:leading-7
                            prose-a:text-violet-600 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-slate-800
                        ">
                            {children}
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
