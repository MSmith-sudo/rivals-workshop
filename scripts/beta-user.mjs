import {randomBytes, createHash} from 'node:crypto';
const names = process.argv.slice(2);
if (!names.length || new Set(names).size !== names.length || names.some(name => !/^[a-zA-Z0-9_-]{1,40}$/.test(name)) || names.length > 200) {
 console.error('Usage: node scripts/beta-user.mjs alice bob (unique usernames: letters, numbers, underscore, hyphen; max 40 chars)'); process.exit(1);
}
const users = Object.create(null);
console.log('Private tester credentials — share each token only with its assigned tester:');
for (const name of names) {
 const token = randomBytes(32).toString('base64url');
 users[name] = createHash('sha256').update(token).digest('hex');
 console.log(name + ': ' + token);
}
console.log('\nPaste this entire JSON object as the Render BETA_USERS environment value:');
console.log(JSON.stringify(users));
console.log('Only hashes go to Render. Do not commit tokens, hashes or this output. Regenerating a name rotates its token.');
