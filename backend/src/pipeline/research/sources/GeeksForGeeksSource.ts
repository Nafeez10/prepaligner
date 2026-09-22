import * as cheerio from 'cheerio';
import { SafeHttpClient } from '../../crawler/SafeHttpClient';
import { IExternalDataSource, ExternalDataSourceResult } from '../IExternalDataSource';

const GEEKSFORGEEKS_BASE_URL = 'https://www.geeksforgeeks.org';
const MAX_EXPERIENCE_PAGES = 3;
const REQUEST_DELAY_MS = 1500;

export class GeeksForGeeksSource implements IExternalDataSource {
  public readonly sourceName = 'geeksforgeeks';
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

    try {
      const slug = this.normalizeCompanyName(companyName);
      const indexUrl = `${GEEKSFORGEEKS_BASE_URL}/tag/${slug}-interview-experience/`;

      const indexRes = await this.httpClient.get(indexUrl);
      const articleLinks = this.extractArticleLinks(indexRes.data, roleName);

      if (articleLinks.length === 0) {
        return result;
      }

      const pagesToFetch = articleLinks.slice(0, MAX_EXPERIENCE_PAGES);

      for (const link of pagesToFetch) {
        try {
          await this.delay(REQUEST_DELAY_MS);
          const articleRes = await this.httpClient.get(link);
          const extracted = this.extractArticleContent(articleRes.data);

          if (extracted.questions.length > 0) {
            result.interviewQuestions.push(...extracted.questions);
          }
          if (extracted.experience) {
            result.interviewExperiences.push(extracted.experience);
          }
        } catch {
          // Skip individual article failures
        }
      }

      if (result.interviewQuestions.length > 0 || result.interviewExperiences.length > 0) {
        result.confidence = result.interviewQuestions.length >= 5 ? 'high' : 'medium';
      }
    } catch {
      // Source entirely failed — return low confidence empty result
    }

    return result;
  }

  private normalizeCompanyName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private extractArticleLinks(html: string, roleName: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];
    const roleTerms = roleName.toLowerCase().split(/\s+/);

    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().toLowerCase();

      const isInterviewExperience =
        href.includes('interview-experience') ||
        text.includes('interview experience') ||
        text.includes('interview question');

      if (!isInterviewExperience) return;

      // Prioritize role-relevant articles if role name is provided
      const isRoleRelevant = roleTerms.some(
        (term) => text.includes(term) || href.includes(term)
      );

      if (isRoleRelevant || roleName === '') {
        links.unshift(href); // Role-relevant → front of queue
      } else {
        links.push(href); // General company interview → back of queue
      }
    });

    // Deduplicate
    return [...new Set(links)];
  }

  private extractArticleContent(html: string): {
    questions: string[];
    experience: string;
  } {
    const $ = cheerio.load(html);

    // Remove noise
    $('script, style, nav, footer, header, iframe, noscript, svg, img, .ad-container, .sidebar').remove();

    const articleBody = $('.entry-content, .text, article, .article-content, .content').first();
    const bodyText = articleBody.length > 0 ? articleBody.text() : $('body').text();
    const cleanText = bodyText.replace(/\s+/g, ' ').trim();

    // Extract questions — look for patterns like "Q1.", "Question:", numbered lists
    const questions: string[] = [];
    const questionPatterns = [
      /(?:Q\d+[.:]\s*)(.*?)(?=Q\d+[.:]|$)/gi,
      /(?:Question\s*\d*[.:]\s*)(.*?)(?=Question\s*\d*[.:]|$)/gi,
      /(?:Round\s*\d+[.:]\s*)(.*?)(?=Round\s*\d+[.:]|$)/gi,
    ];

    for (const pattern of questionPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(cleanText)) !== null && questions.length < 15) {
        const q = match[1].trim();
        if (q.length > 20 && q.length < 500) {
          questions.push(q);
        }
      }
    }

    // Take a meaningful chunk of the experience text
    const experience = cleanText.substring(0, 2000);

    return { questions, experience };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
