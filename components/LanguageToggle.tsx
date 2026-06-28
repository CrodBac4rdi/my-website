'use client';

import { useI18n } from '@/lib/i18n';

export default function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <button
      onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
      className="p-2 bg-elev/50 dark:bg-white/10 rounded-xl border border-line dark:border-white/20 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all font-bold text-xs uppercase"
    >
      {language}
    </button>
  );
}
