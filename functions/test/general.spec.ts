import { callFunction } from './utils';

describe('general', () => {
  it('getAllDBPlayers', async () => {
    console.log(await callFunction('getAllDBPlayers'));
  });

  it('getHomeTop', async () => {
    const result = await callFunction('getHomeTop', { verbose: true });
    console.log(result);
  });
});
