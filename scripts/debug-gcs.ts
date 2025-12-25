
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { env } from '../src/config/env';

async function check() {
  console.log("--- DEBUGGING GCS PERMISSIONS ---");
  console.log("Project ID from env:", env.GCS_PROJECT_ID);
  console.log("Key File from env:", env.GCS_KEY_FILE);

  const storageConfig: any = { projectId: env.GCS_PROJECT_ID };
  if (env.GCS_KEY_FILE) {
    storageConfig.keyFilename = path.resolve(env.GCS_KEY_FILE);
  }

  const storage = new Storage(storageConfig);
  
  try {
    const [buckets] = await storage.getBuckets();
    console.log("Authenticated successfully. Buckets in this project:");
    buckets.forEach(b => console.log(` - ${b.name}`));
  } catch (e: any) {
    console.error("FAILED to list buckets. Your credentials might be invalid or missing permissions.");
    console.error(e.message);
  }

  // Check specific bucket from the error
  const targetBucket = 'love-api-uploads';
  console.log(`\nChecking access to bucket: ${targetBucket}...`);
  const bucket = storage.bucket(targetBucket);
  
  try {
    const [exists] = await bucket.exists();
    console.log(`Bucket '${targetBucket}' exists: ${exists}`);
    if (exists) {
        // Try to list files to verify access
        const [files] = await bucket.getFiles({ maxResults: 1 });
        console.log(`Successfully listed files in '${targetBucket}'. Access OK.`);
    }
  } catch (e: any) {
    console.error(`FAILED to access bucket '${targetBucket}'`);
    console.error(e.message);
  }
}

check();
