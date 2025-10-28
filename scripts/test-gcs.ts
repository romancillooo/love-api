// love-api/scripts/test-gcs.ts
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { env } from '@/config/env';

const storage = new Storage({
  projectId: env.GCS_PROJECT_ID,
  keyFilename: path.resolve(env.GCS_KEY_FILE),
});

async function testConnection() {
  const [buckets] = await storage.getBuckets();
  console.log('✅ Buckets visibles:', buckets.map(b => b.name));
}

testConnection().catch(console.error);
