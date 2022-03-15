import * as sha512 from 'js-sha512';
import { sign as jwtSign, verify as jwtVerify } from 'jsonwebtoken';

import { jwtPrivateRsaKey, jwtPublicRsaKey } from '../src/websiteEditingFunctions/jwt_rsa_keys';
import { callFunction, wait } from './utils';

describe('general', () => {
  it('getAllDBPlayers', async () => {
    console.log(await callFunction('getAllDBPlayers'));
  });

  it('getHomeTop', async () => {
    const result = await callFunction('getHomeTop', { verbose: true });
    console.log(result);
  });

  it('test', async () => {
    console.log(sha512.sha512('test-user-id-1'));
    return;
    const token = jwtSign(
      {
        userId: 'test-user-id-1',
        expiresAt: new Date().setSeconds(new Date().getSeconds() + 3),
      },
      jwtPrivateRsaKey,
      {
        algorithm: 'RS256',
      },
    );
    console.log(token);
    await wait(2000);
    const decodedToken = jwtVerify(token, jwtPublicRsaKey);
    console.log(decodedToken);
    console.log(new Date((decodedToken as any).expiresAt) >= new Date());
  });
});
