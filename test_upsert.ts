import { getMerchantBundleByUsername, replaceMerchantBundle } from './server/store-repository';
import Database from 'better-sqlite3';

async function run() {
  const db = new Database('./server/myshoplink.db');
  const user = db.prepare('SELECT username FROM stores LIMIT 1').get() as { username: string };
  if (user) {
    try {
      console.log('Testing username', user.username);
      const bundle = await getMerchantBundleByUsername(user.username);
      if (bundle) {
        await replaceMerchantBundle(bundle);
        console.log('Success, wrote bundle.');
      }
    } catch (e: any) {
      console.error('ERROR =>', e.message);
    }
  }
}
run();
