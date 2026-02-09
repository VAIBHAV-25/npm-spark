import { searchPackages } from './npm-api';

interface AISearchResult {
  packageName: string;
  confidence: number;
  reason: string;
  tags: string[];
}

const problemKeywords = {
  'date': ['date-fns', 'dayjs', 'luxon', 'moment'],
  'time': ['date-fns', 'dayjs', 'luxon'],
  'form': ['react-hook-form', 'formik', 'final-form', 'react-final-form'],
  'validation': ['joi', 'yup', 'zod', 'validator', 'ajv'],
  'state management': ['redux', 'zustand', 'mobx', 'jotai', 'recoil'],
  'http request': ['axios', 'fetch', 'node-fetch', 'got', 'superagent'],
  'api': ['axios', 'fetch', 'express', 'fastify'],
  'routing': ['react-router', 'vue-router', 'next', 'express'],
  'css': ['styled-components', 'emotion', 'tailwindcss', 'sass'],
  'styling': ['styled-components', 'emotion', 'tailwindcss', 'sass'],
  'test': ['jest', 'vitest', 'mocha', 'chai', 'testing-library'],
  'unit test': ['jest', 'vitest', 'mocha'],
  'animation': ['framer-motion', 'gsap', 'react-spring', 'anime'],
  'chart': ['recharts', 'chart.js', 'victory', 'd3', 'plotly.js'],
  'graph': ['recharts', 'chart.js', 'victory', 'd3'],
  'table': ['react-table', 'ag-grid', 'tanstack-table'],
  'data grid': ['ag-grid', 'react-table', 'tanstack-table'],
  'drag drop': ['react-dnd', 'dnd-kit', 'react-beautiful-dnd'],
  'file upload': ['multer', 'formidable', 'busboy', 'react-dropzone'],
  'image': ['sharp', 'jimp', 'imagemagick', 'canvas'],
  'pdf': ['pdfkit', 'jspdf', 'pdf-lib', 'react-pdf'],
  'markdown': ['marked', 'remark', 'markdown-it', 'react-markdown'],
  'json': ['superjson', 'json5', 'jsonwebtoken'],
  'csv': ['csv-parser', 'papaparse', 'fast-csv'],
  'excel': ['xlsx', 'exceljs', 'node-xlsx'],
  'email': ['nodemailer', 'sendgrid', 'mailgun-js'],
  'auth': ['passport', 'jsonwebtoken', 'bcrypt', 'next-auth'],
  'authentication': ['passport', 'jsonwebtoken', 'next-auth', 'auth0'],
  'encryption': ['bcrypt', 'crypto-js', 'node-forge'],
  'websocket': ['socket.io', 'ws', 'sockjs'],
  'real-time': ['socket.io', 'pusher', 'ably'],
  'database': ['mongoose', 'prisma', 'sequelize', 'typeorm'],
  'mongodb': ['mongoose', 'mongodb'],
  'sql': ['sequelize', 'knex', 'typeorm', 'prisma'],
  'postgres': ['pg', 'sequelize', 'prisma', 'typeorm'],
  'redis': ['redis', 'ioredis'],
  'cache': ['node-cache', 'redis', 'lru-cache'],
  'logging': ['winston', 'pino', 'morgan', 'bunyan'],
  'debug': ['debug', 'chalk', 'consola'],
  'cli': ['commander', 'yargs', 'inquirer', 'chalk'],
  'terminal': ['chalk', 'ora', 'inquirer', 'commander'],
  'color': ['chalk', 'colors', 'ansi-colors'],
  'uuid': ['uuid', 'nanoid', 'cuid'],
  'random': ['uuid', 'nanoid', 'faker'],
  'mock': ['faker', 'chance', 'casual', 'msw'],
  'fake data': ['faker', 'chance', 'casual'],
  'compress': ['compression', 'zlib', 'archiver'],
  'zip': ['archiver', 'adm-zip', 'jszip'],
  'crypto': ['crypto-js', 'bcrypt', 'node-forge'],
  'hash': ['bcrypt', 'crypto-js', 'hash.js'],
  'qr code': ['qrcode', 'qr-image'],
  'barcode': ['jsbarcode', 'bwip-js'],
  'serialize': ['superjson', 'serialize-javascript'],
  'parse': ['parse', 'cheerio', 'xml2js', 'csv-parser'],
  'scrape': ['cheerio', 'puppeteer', 'playwright', 'jsdom'],
  'crawler': ['cheerio', 'puppeteer', 'playwright'],
  'url': ['url-parse', 'query-string', 'qs'],
  'query string': ['query-string', 'qs'],
  'path': ['path', 'upath', 'pathe'],
  'filesystem': ['fs-extra', 'graceful-fs', 'memfs'],
  'watch': ['chokidar', 'nodemon', 'watchman'],
  'process': ['pm2', 'forever', 'nodemon'],
  'lint': ['eslint', 'prettier', 'stylelint'],
  'format': ['prettier', 'eslint'],
  'typescript': ['typescript', '@types/node', 'ts-node'],
  'build': ['webpack', 'vite', 'rollup', 'esbuild'],
  'bundle': ['webpack', 'rollup', 'esbuild', 'parcel'],
  'server': ['express', 'fastify', 'koa', 'hapi'],
  'framework': ['express', 'next', 'nuxt', 'gatsby'],
};

function extractKeywords(query: string): string[] {
  const lowercaseQuery = query.toLowerCase();
  const foundKeywords: string[] = [];
  
  for (const [keyword, _] of Object.entries(problemKeywords)) {
    if (lowercaseQuery.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }
  
  return foundKeywords;
}

function scoreRelevance(query: string, packageName: string, keywords: string[]): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  const lowerPkg = packageName.toLowerCase();
  
  if (lowerPkg === lowerQuery) score += 100;
  if (lowerPkg.includes(lowerQuery)) score += 50;
  
  for (const keyword of keywords) {
    if (lowerPkg.includes(keyword)) score += 30;
  }
  
  return score;
}

export async function aiPackageSearch(naturalQuery: string): Promise<AISearchResult[]> {
  const keywords = extractKeywords(naturalQuery);
  const results: AISearchResult[] = [];
  
  const recommendedPackages = new Set<string>();
  keywords.forEach(keyword => {
    const packages = problemKeywords[keyword] || [];
    packages.forEach(pkg => recommendedPackages.add(pkg));
  });
  
  if (recommendedPackages.size === 0) {
    const searchTerms = naturalQuery
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 3 && !['need', 'want', 'looking', 'package', 'library', 'tool'].includes(word))
      .join(' ');
    
    if (searchTerms) {
      try {
        const searchResults = await searchPackages(searchTerms, 8);
        searchResults.objects.slice(0, 5).forEach(obj => {
          results.push({
            packageName: obj.package.name,
            confidence: obj.score.final * 100,
            reason: obj.package.description || 'Relevant package found via search',
            tags: obj.package.keywords?.slice(0, 3) || [],
          });
        });
      } catch {
        return [];
      }
      
      return results;
    }
    
    return [];
  }
  
  for (const pkgName of Array.from(recommendedPackages).slice(0, 8)) {
    const confidence = scoreRelevance(naturalQuery, pkgName, keywords);
    
    let reason = 'Recommended for ';
    if (keywords.length > 0) {
      reason += keywords.join(', ');
    } else {
      reason += 'your use case';
    }
    
    results.push({
      packageName: pkgName,
      confidence: Math.min(confidence, 95),
      reason,
      tags: keywords,
    });
  }
  
  results.sort((a, b) => b.confidence - a.confidence);
  
  return results.slice(0, 6);
}

export function isNaturalLanguageQuery(query: string): boolean {
  const naturalLanguageIndicators = [
    'i need',
    'i want',
    'looking for',
    'how to',
    'help me',
    'find',
    'search for',
    'recommend',
    'best',
    'package for',
    'library for',
  ];
  
  const lowerQuery = query.toLowerCase();
  return naturalLanguageIndicators.some(indicator => lowerQuery.includes(indicator)) || 
         query.split(' ').length > 3;
}
