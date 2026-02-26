import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';

type SupportedLang = 'en' | 'zh';

interface LangMessages {
  greeting: string;
  setSuccess: string;
  currentLang: string;
  available: string;
}

const MESSAGES: Record<SupportedLang, LangMessages> = {
  en: {
    greeting: 'VibeBetter CLI Language Settings',
    setSuccess: 'Language set to English',
    currentLang: 'Current language',
    available: 'Available languages',
  },
  zh: {
    greeting: 'VibeBetter CLI 语言设置',
    setSuccess: '语言已设置为中文',
    currentLang: '当前语言',
    available: '可用语言',
  },
};

const LANG_NAMES: Record<SupportedLang, string> = {
  en: 'English',
  zh: '中文 (Chinese)',
};

let currentLang: SupportedLang = 'en';

function isValidLang(lang: string): lang is SupportedLang {
  return lang === 'en' || lang === 'zh';
}

export const langCommand = new Command('lang')
  .description('Set CLI output language (en/zh)')
  .argument('[language]', 'Language code (en or zh)')
  .option('--show', 'Show current language setting')
  .action(async (language, opts) => {
    header('Language Settings');

    if (opts.show || !language) {
      const msgs = MESSAGES[currentLang];
      console.log();
      console.log(`  ${pc.dim(msgs.currentLang)}: ${pc.bold(LANG_NAMES[currentLang])}`);
      console.log();
      console.log(`  ${pc.dim(msgs.available)}:`);
      for (const [code, name] of Object.entries(LANG_NAMES)) {
        const marker = code === currentLang ? pc.green(' ●') : pc.dim(' ○');
        console.log(`  ${marker} ${pc.bold(code)} — ${name}`);
      }
      console.log();
      info('Usage: vibe lang <en|zh>');
      return;
    }

    if (!isValidLang(language)) {
      console.log(pc.red(`  Unsupported language: "${language}"`));
      console.log(pc.dim(`  Supported: ${Object.keys(LANG_NAMES).join(', ')}`));
      return;
    }

    currentLang = language;
    const msgs = MESSAGES[currentLang];
    console.log();
    console.log(`  ${pc.green('✓')} ${msgs.setSuccess}`);
    console.log();
  });
