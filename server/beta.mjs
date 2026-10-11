import {createHash, timingSafeEqual} from 'node:crypto';

const digest = value => createHash('sha256').update(value).digest();
export function betaGuard(env) {
 const production = env.NODE_ENV === 'production';
 const enabled = production || env.BETA_ENABLED === 'true';
 const origin = env.APP_ORIGIN || env.RENDER_EXTERNAL_URL || 'http://127.0.0.1:5173';
 const parsed = new URL(origin);
 if (parsed.origin !== origin || (production && parsed.protocol !== 'https:')) throw Error('APP_ORIGIN must be an exact origin; production requires HTTPS');
 let users = {};
 if (enabled) {
  try { users = JSON.parse(env.BETA_USERS || '{}'); } catch { throw Error('BETA_USERS must be a JSON object'); }
  if (!users || Array.isArray(users) || typeof users !== 'object' || !Object.keys(users).length || Object.keys(users).length > 200 || Object.entries(users).some(([name, hash]) => !/^[a-zA-Z0-9_-]{1,40}$/.test(name) || typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash))) throw Error('BETA_USERS requires 1–200 usernames mapped to SHA-256 hashes of generated tokens');
 }
 function integer(key, fallback, max) {
  const value = Number(env[key] ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > max) throw Error('Invalid ' + key);
  return value;
 }
 const perMinute = integer('BETA_REQUESTS_PER_MINUTE', 10, 100);
 const perDay = integer('BETA_REQUESTS_PER_DAY', 100, 10000);
 const totalDay = integer('BETA_GLOBAL_REQUESTS_PER_DAY', 500, 100000);
 const concurrent = integer('BETA_MAX_CONCURRENT', 2, 20);
 const buckets = new Map();
 let day = '', total = 0, active = 0, authWindow = 0, authFailures = 0;
 return {
  enabled, origin, production,
  hostAllowed(host) {
   if (typeof host !== 'string' || !/^[a-zA-Z0-9.:[\]-]+$/.test(host)) return false;
   try { const hostname = new URL('http://' + host).hostname; return hostname === parsed.hostname || (!production && ['localhost', '127.0.0.1'].includes(hostname)); } catch { return false; }
  },
  authenticate(req) {
   if (!enabled) return {user: req.socket.remoteAddress || 'local'};
   const now = Date.now();
   if (now - authWindow >= 60000) { authWindow = now; authFailures = 0; }
   // Global failure cap avoids relying on spoofable forwarding headers.
   if (authFailures >= 100) return {status: 429, retry: Math.max(1, Math.ceil((authWindow + 60000 - now) / 1000))};
   const header = req.headers.authorization || '';
   if (header.length <= 1024 && /^Basic [A-Za-z0-9+/]+=*$/.test(header)) {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const colon = decoded.indexOf(':');
    const user = decoded.slice(0, colon), token = decoded.slice(colon + 1);
    const known = Object.hasOwn(users, user);
    const expected = Buffer.from(known ? users[user] : '0'.repeat(64), 'hex');
    if (colon > 0 && timingSafeEqual(digest(token), expected) && known) return {user};
   }
   authFailures++;
   return {status: 401};
  },
  reserve(user) {
   const now = Date.now(), today = new Date(now).toISOString().slice(0, 10);
   if (today !== day) { day = today; total = 0; buckets.clear(); }
   let bucket = buckets.get(user);
   if (!bucket) {
    if (buckets.size >= 1000) return {retry: 60};
    bucket = {until: now + 60000, minute: 0, daily: 0}; buckets.set(user, bucket);
   }
   if (now >= bucket.until) { bucket.until = now + 60000; bucket.minute = 0; }
   const midnight = Math.ceil((Date.parse(today + 'T00:00:00Z') + 86400000 - now) / 1000);
   if (bucket.daily >= perDay || total >= totalDay) return {retry: midnight};
   if (bucket.minute >= perMinute) return {retry: Math.max(1, Math.ceil((bucket.until - now) / 1000))};
   if (active >= concurrent) return {retry: 5};
   bucket.minute++; bucket.daily++; total++; active++;
   let released = false;
   return {release() { if (!released) { active--; released = true; } }};
  }
 };
}
