import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

async function getEnvValue(varName: string): Promise<string> {
  // Check if the environment variable is already set
  if (process.env[varName]) {
    return process.env[varName]!;
  }

  // Try to read from the .env file directly
  try {
    const envFilePath = path.join(process.cwd(), '.env');
    const envContent = await fs.readFile(envFilePath, 'utf8');
    
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.startsWith(`${varName}=`)) {
        const value = line.substring(line.indexOf('=') + 1).trim();
        // Remove surrounding quotes if present
        return value.replace(/^['"]|['"]$/g, '');
      }
    }
  } catch (error) {
    console.error(`Error reading .env file:`, error);
  }

  // Return empty string if not found anywhere
  return '';
}

export async function GET() {
  // Only expose non-sensitive environment information
  const mongodbEnvironment = await getEnvValue('MONGODB_ENV');
  const nodeEnv = process.env.NODE_ENV || '';

  return new Response(JSON.stringify({
    mongodbEnvironment,
    nodeEnv,
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}