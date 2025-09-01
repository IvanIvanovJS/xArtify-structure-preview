import 'server-only';
import { kv } from '@vercel/kv';


// По желание – runtime check за env в dev:
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error('Missing KV_REST_API_URL or KV_REST_API_TOKEN');
}


export { kv };