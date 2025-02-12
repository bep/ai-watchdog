import * as fs from 'fs';
import * as path from 'path';
import { analyzeWithGPT, extractConfidenceScore } from '../index';

describe('AI Detection Tests', () => {
  let apiKey: string;

  beforeAll(() => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY environment variable is required to run tests');
    }
    apiKey = key;
  });

  // Helper function to read file content
  const readFileContent = (filePath: string): string => {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
  };

  // Helper function to get all files in a directory
  const getFilesInDir = (dirPath: string): string[] => {
    return fs.readdirSync(path.join(process.cwd(), dirPath))
      .map(file => path.join(dirPath, file));
  };

  it('should detect AI-generated content with high confidence', async () => {
    const aiFiles = getFilesInDir('tests/ai');
    
    for (const filePath of aiFiles) {
      const content = readFileContent(filePath);
      const response = await analyzeWithGPT(apiKey, {
        title: 'Test PR',
        description: 'Test Description',
        changes: [{
          filename: filePath,
          additions: content
        }]
      });

      const confidenceScore = await extractConfidenceScore(response);
      console.log(`\n=== Analysis for AI file: ${filePath} ===`);
      console.log(response);
      console.log(`Confidence Score: ${confidenceScore}%`);
      console.log('=====================================\n');
      
      expect(confidenceScore).toBeGreaterThan(50);
    }
  }, 30000); // Increased timeout for API calls

  it('should detect human-written content with low confidence', async () => {
    const humanFiles = getFilesInDir('tests/human');
    
    for (const filePath of humanFiles) {
      const content = readFileContent(filePath);
      const response = await analyzeWithGPT(apiKey, {
        title: 'Test PR',
        description: 'Test Description',
        changes: [{
          filename: filePath,
          additions: content
        }]
      });

      const confidenceScore = await extractConfidenceScore(response);
      console.log(`\n=== Analysis for human file: ${filePath} ===`);
      console.log(response);
      console.log(`Confidence Score: ${confidenceScore}%`);
      console.log('=====================================\n');
      
      expect(confidenceScore).toBeLessThan(50);
    }
  }, 30000); // Increased timeout for API calls
}); 