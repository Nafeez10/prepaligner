import fs from 'fs';
import path from 'path';
import { KitGenerationOrchestrator } from './pipeline/orchestrator/KitGenerationOrchestrator';
import { BatchInputSchema, BatchOutput, BatchOutputKit } from './types/schemas';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  let inputPath = '';
  let outputPath = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input') inputPath = args[i + 1];
    if (args[i] === '--output') outputPath = args[i + 1];
  }

  if (!inputPath || !outputPath) {
    console.error("Usage: npm run evaluate -- --input <cases.json> --output <kits.json>");
    process.exit(1);
  }

  const resolvedInputPath = path.resolve(process.cwd(), inputPath);
  const resolvedOutputPath = path.resolve(process.cwd(), outputPath);

  let rawData;
  try {
    rawData = fs.readFileSync(resolvedInputPath, 'utf8');
  } catch (e) {
    console.error(`Could not read input file at ${resolvedInputPath}`);
    process.exit(1);
  }

  let inputCases;
  try {
    inputCases = JSON.parse(rawData);
    // Validate schema
    const parsed = BatchInputSchema.safeParse(inputCases);
    if (!parsed.success) {
      console.error("Invalid input cases format", parsed.error);
      process.exit(1);
    }
    inputCases = parsed.data;
  } catch (e) {
    console.error("Input file is not valid JSON.");
    process.exit(1);
  }

  const orchestrator = new KitGenerationOrchestrator();
  const outputKits: BatchOutputKit[] = [];

  for (const tc of inputCases) {
    console.log(`Processing case: ${tc.id}`);
    try {
      const kit = await orchestrator.generateKit(tc.jd, tc.company_url, tc.days);
      outputKits.push({
        id: tc.id,
        status: "ok",
        kit,
        error: null
      });
      console.log(`✓ Case ${tc.id} generated successfully.`);
    } catch (e: any) {
      console.error(`✗ Case ${tc.id} failed:`, e.message);
      outputKits.push({
        id: tc.id,
        status: "failed",
        kit: null,
        error: {
          code: "GENERATION_FAILED",
          message: e.message || "Unknown error occurred"
        }
      });
    }
  }

  const output: BatchOutput = {
    version: "1.0",
    generated_at: new Date().toISOString(),
    kits: outputKits
  };

  fs.writeFileSync(resolvedOutputPath, JSON.stringify(output, null, 2));
  console.log(`\nEvaluation complete. Wrote ${outputKits.length} results to ${resolvedOutputPath}`);
}

main().catch(console.error);
