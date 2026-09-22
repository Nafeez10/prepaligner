import * as cheerio from 'cheerio';
import { SafeHttpClient } from '../../crawler/SafeHttpClient';
import { IExternalDataSource, ExternalDataSourceResult } from '../IExternalDataSource';

const DUCKDUCKGO_HTML_URL = 'https://html.duckduckgo.com/html/';
const MAX_SNIPPETS_PER_QUERY = 5;

type ScopedSearch = {
  site: string;
  label: string;
};

const SCOPED_SEARCHES: ScopedSearch[] = [
  { site: 'glassdoor.com', label: 'glassdoor' },
  { site: 'reddit.com', label: 'reddit' },
  { site: 'ambitionbox.com', label: 'ambitionbox' },
  { site: 'leetcode.com/discuss', label: 'leetcode' },
];

export class DuckDuckGoSource implements IExternalDataSource {
  public readonly sourceName = 'duckduckgo';
  private httpClient: SafeHttpClient;

  constructor() {
    this.httpClient = new SafeHttpClient();
  }

  public async search(companyName: string, roleName: string): Promise<ExternalDataSourceResult> {
    const result: ExternalDataSourceResult = {
      source: this.sourceName,
      interviewQuestions: [],
      interviewExperiences: [],
      companyInsights: [],
      confidence: 'low',
    };

    const allSnippets: string[] = [];

    for (const scope of SCOPED_SEARCHES) {
      try {
        const query = this.buildQuery(companyName, roleName, scope.site);
        const snippets = await this.fetchSnippets(query);
        allSnippets.push(...snippets.map((s) => `[${scope.label}] ${s}`));
      } catch {
        // Individual scope failures are fine
      }
    }

    if (allSnippets.length === 0) {
      return result;
    }

    // Classify snippets into questions vs experiences vs insights
    for (const snippet of allSnippets) {
      const lower = snippet.toLowerCase();

      if (
        lower.includes('interview question') ||
        lower.includes('asked me') ||
        lower.includes('they asked') ||
        lower.includes('coding round') ||
        lower.includes('technical round')
      ) {
        result.interviewQuestions.push(snippet);
      } else if (
        lower.includes('interview experience') ||
        lower.includes('interview process') ||
        lower.includes('rounds of') ||
        lower.includes('got an offer')
      ) {
        result.interviewExperiences.push(snippet);
      } else {
        result.companyInsights.push(snippet);
      }
    }

    const totalFindings =
      result.interviewQuestions.length +
      result.interviewExperiences.length +
      result.companyInsights.length;

    if (totalFindings >= 8) {
      result.confidence = 'high';
    } else if (totalFindings >= 3) {
      result.confidence = 'medium';
    }

    return result;
  }

  private buildQuery(companyName: string, roleName: string, site: string): string {
    const roleClause = roleName ? ` ${roleName}` : '';
    return `${companyName}${roleClause} interview questions site:${site}`;
  }

  private async fetchSnippets(query: string): Promise<string[]> {
    const encodedQuery = encodeURIComponent(query);
    const url = `${DUCKDUCKGO_HTML_URL}?q=${encodedQuery}`;

    const res = await this.httpClient.get(url);

    if (!res.data || typeof res.data !== 'string') {
      return [];
    }

    return this.extractSnippets(res.data);
  }

  private extractSnippets(html: string): string[] {
    const $ = cheerio.load(html);
    const snippets: string[] = [];

    // DuckDuckGo HTML results use .result__snippet for snippet text
    $('.result__snippet').each((_, el) => {
      if (snippets.length >= MAX_SNIPPETS_PER_QUERY) return false;
      const text = $(el).text().replace(/<[^>]*>/g, '').trim();
      if (text.length > 20) {
        snippets.push(text);
      }
    });

    // Fallback: try extracting from anchor tags with result__snippet class
    if (snippets.length === 0) {
      $('a.result__snippet').each((_, el) => {
        if (snippets.length >= MAX_SNIPPETS_PER_QUERY) return false;
        const text = $(el).text().replace(/<[^>]*>/g, '').trim();
        if (text.length > 20) {
          snippets.push(text);
        }
      });
    }

    return snippets;
  }
}
