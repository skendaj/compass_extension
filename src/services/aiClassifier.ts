import { ClassificationResult, QueryCategory } from '../types';

export class AIClassifier {
  private engineeringKeywords = [
    'code', 'bug', 'error', 'api', 'database', 'deploy', 'deployment',
    'crash', 'performance', 'server', 'build', 'test', 'testing',
    'git', 'docker', 'kubernetes', 'ci/cd', 'production', 'staging',
    'backend', 'frontend', 'authentication', 'authorization', 'cors',
    'npm', 'yarn', 'webpack', 'babel', 'typescript', 'javascript',
    'python', 'java', 'react', 'angular', 'vue', 'node', 'express',
    'mongodb', 'postgresql', 'mysql', 'redis', 'cache', 'caching',
    'microservice', 'architecture', 'scaling', 'load balancer',
    'aws', 'azure', 'gcp', 'cloud', 'lambda', 'function',
    'logging', 'monitoring', 'grafana', 'prometheus', 'elk',
    'security', 'vulnerability', 'ssl', 'https', 'certificate',
    'repository', 'branch', 'merge', 'pull request', 'commit'
  ];

  private hrKeywords = [
    'leave', 'vacation', 'pto', 'benefits', 'payroll', 'salary',
    'insurance', 'onboarding', 'policy', 'hr', 'holiday', 'time off',
    'sick leave', 'maternity', 'paternity', '401k', 'retirement',
    'health', 'dental', 'vision', 'wellness', 'mental health',
    'employee', 'personnel', 'hiring', 'termination', 'resignation',
    'performance review', 'feedback', 'promotion', 'bonus',
    'relocation', 'remote work', 'wfh', 'work from home',
    'team building', 'culture', 'diversity', 'inclusion',
    'training', 'development', 'career', 'growth'
  ];

  classify(query: string): ClassificationResult {
    const lowerQuery = query.toLowerCase();
    
    const engMatches = this.countKeywordMatches(lowerQuery, this.engineeringKeywords);
    const hrMatches = this.countKeywordMatches(lowerQuery, this.hrKeywords);
    
    const matchedKeywords: string[] = [];
    
    let category: QueryCategory;
    let confidence: number;
    
    if (hrMatches > engMatches) {
      category = 'hr';
      confidence = this.calculateConfidence(hrMatches, query.split(' ').length);
      matchedKeywords.push(...this.getMatchedKeywords(lowerQuery, this.hrKeywords));
    } else if (engMatches > 0) {
      category = 'engineering';
      confidence = this.calculateConfidence(engMatches, query.split(' ').length);
      matchedKeywords.push(...this.getMatchedKeywords(lowerQuery, this.engineeringKeywords));
    } else {
      category = 'general';
      confidence = 0.5;
    }
    
    return {
      category,
      confidence,
      keywords: matchedKeywords.slice(0, 5)
    };
  }

  private countKeywordMatches(query: string, keywords: string[]): number {
    return keywords.filter(keyword => query.includes(keyword)).length;
  }

  private getMatchedKeywords(query: string, keywords: string[]): string[] {
    return keywords.filter(keyword => query.includes(keyword));
  }

  private calculateConfidence(matches: number, totalWords: number): number {
    const density = matches / Math.max(totalWords, 1);
    return Math.min(0.95, 0.5 + density);
  }

  extractTechnicalTerms(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const terms = this.getMatchedKeywords(lowerQuery, this.engineeringKeywords);
    
    const capitalizedTerms = query.match(/\b[A-Z][a-zA-Z0-9]+\b/g) || [];
    
    return [...new Set([...terms, ...capitalizedTerms.map(t => t.toLowerCase())])];
  }
}

export const aiClassifier = new AIClassifier();

