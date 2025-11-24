import { env } from "@/env";
import { ChargilyClient } from '@chargily/chargily-pay';

export const client = env.CHARGILY_SK
    ? new ChargilyClient({
          api_key: env.CHARGILY_SK,
          mode: env.NODE_ENV === 'production' ? 'live' : 'test',
      })
    : null;


// this prices are the actual prices from chargily dashboard, if you are using this project with new api please go and fill them or we will lately add an automatic way to do this
// this is not ideal sollution but its fine for now
export const prices: Record<string, string> = {
    'basic-monthly': '01kary02n50ywvr57dbx8b2dc6',
    'basic-yearly': '01kary8q885epvc1ksxrne6sya',
    'standard-monthly': '01kary3d5krkanxxprn9naezfb',
    'standard-yearly': '01kary9wyd78pkzkafp62a608h',
    'premium-monthly': '01kary676a524xw9e8vjk6g3zq',
    'premium-yearly': '01karyb06b20amq946j8pxw2c4',
}