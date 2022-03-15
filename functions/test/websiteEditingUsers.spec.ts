import { expect } from 'chai';
import * as sha512 from 'js-sha512';
import * as jwt from 'jsonwebtoken';

import { jwtPublicRsaKey } from '../src/websiteEditingFunctions/jwt_rsa_keys';
import { callFunction, getCurrentUser, signInTestUser, signOutUser } from './utils';

describe('websiteEditingUsers', () => {
  beforeEach(async () => {
    await signInTestUser();
    await callFunction<void>('addTestUserToTesting');
  });

  afterEach(async () => {
    await callFunction<void>('deleteAllUsersInTestingDB');
    await signOutUser();
  });

  it('empty waiting, empty editors, accept', async () => {
    const user = {
      id: sha512.sha512('test-id-1'),
      name: {
        first: 'test-first-name-1',
        last: 'test-last-name-1',
      },
    };

    // Check user to be unauthorized
    {
      let error: Error | undefined = undefined;
      try {
        await callFunction<{ userId: string }, { token: string; expiresAt: number }>('checkUserForEditing', {
          userId: user.id,
        });
      } catch (err) {
        error = err as any;
      }
      expect(error).not.to.be.undefined;
      expect(error).to.be.an('Error');
      expect(error?.message).to.be.equal("User isn't authorized to edit website.");
    }

    // Check user waiting to be empty
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting).to.be.empty;
    }

    // Add user to waiting
    {
      await callFunction<{ userId: string; firstName: string; lastName: string }, void>(
        'addUserToWaitingForRegistrationForEditing',
        {
          userId: user.id,
          firstName: user.name.first,
          lastName: user.name.last,
        },
      );
    }

    // Check user to be waiting
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting.length).to.be.equal(1);
      expect(userWaiting[0]).to.be.deep.equal(user);
    }

    // Get json web token for test user
    const testUserJwtPayload = await callFunction<{ userId: string }, { token: string; expiresAt: number }>(
      'checkUserForEditing',
      {
        userId: sha512.sha512(getCurrentUser()?.uid ?? ''),
      },
    );

    // Accept user waiting
    {
      await callFunction<{ userId: string; acceptDecline: 'accept' | 'decline'; jsonWebToken: string }, void>(
        'acceptDeclineUserWaitingForRegistrationForEditing',
        {
          userId: user.id,
          acceptDecline: 'accept',
          jsonWebToken: testUserJwtPayload.token,
        },
      );
    }

    // Check user to be authorized
    {
      const jwtPayload = await callFunction<{ userId: string }, { token: string; expiresAt: number }>(
        'checkUserForEditing',
        {
          userId: user.id,
        },
      );
      expect(new Date(jwtPayload.expiresAt)).to.be.greaterThanOrEqual(new Date());
      const decodedToken = jwt.verify(jwtPayload.token, jwtPublicRsaKey) as { userId: string; expiresAt: number };
      expect(decodedToken.expiresAt).to.be.equal(jwtPayload.expiresAt);
      expect(decodedToken.userId).to.be.equal(user.id);
    }

    // Check user waiting to be empty
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting).to.be.empty;
    }
  });

  it('empty waiting, empty editors, decline', async () => {
    const user = {
      id: sha512.sha512('test-id-1'),
      name: {
        first: 'test-first-name-1',
        last: 'test-last-name-1',
      },
    };

    // Check user to be unauthorized
    {
      let error: Error | undefined = undefined;
      try {
        await callFunction<{ userId: string }, { token: string; expiresAt: number }>('checkUserForEditing', {
          userId: user.id,
        });
      } catch (err) {
        error = err as any;
      }
      expect(error).not.to.be.undefined;
      expect(error).to.be.an('Error');
      expect(error?.message).to.be.equal("User isn't authorized to edit website.");
    }

    // Check user waiting to be empty
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting).to.be.empty;
    }

    // Add user to waiting
    {
      await callFunction<{ userId: string; firstName: string; lastName: string }, void>(
        'addUserToWaitingForRegistrationForEditing',
        {
          userId: user.id,
          firstName: user.name.first,
          lastName: user.name.last,
        },
      );
    }

    // Check user to be waiting
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting.length).to.be.equal(1);
      expect(userWaiting[0]).to.be.deep.equal(user);
    }

    // Get json web token for test user
    const testUserJwtPayload = await callFunction<{ userId: string }, { token: string; expiresAt: number }>(
      'checkUserForEditing',
      {
        userId: sha512.sha512(getCurrentUser()?.uid ?? ''),
      },
    );

    // Decline user waiting
    {
      await callFunction<{ userId: string; acceptDecline: 'accept' | 'decline'; jsonWebToken: string }, void>(
        'acceptDeclineUserWaitingForRegistrationForEditing',
        {
          userId: user.id,
          acceptDecline: 'decline',
          jsonWebToken: testUserJwtPayload.token,
        },
      );
    }

    // Check user to be unauthorized
    {
      let error: Error | undefined = undefined;
      try {
        await callFunction<{ userId: string }, { token: string; expiresAt: number }>('checkUserForEditing', {
          userId: user.id,
        });
      } catch (err) {
        error = err as any;
      }
      expect(error).not.to.be.undefined;
      expect(error).to.be.an('Error');
      expect(error?.message).to.be.equal("User isn't authorized to edit website.");
    }

    // Check user waiting to be empty
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting).to.be.empty;
    }
  });

  it('not empty waiting, not empty editors, accept', async () => {
    const user1 = {
      id: sha512.sha512('test-id-1'),
      name: {
        first: 'test-first-name-1',
        last: 'test-last-name-1',
      },
    };
    const user2 = {
      id: sha512.sha512('test-id-2'),
      name: {
        first: 'test-first-name-2',
        last: 'test-last-name-2',
      },
    };
    const user3 = {
      id: sha512.sha512('test-id-3'),
      name: {
        first: 'test-first-name-3',
        last: 'test-last-name-3',
      },
    };

    // Get json web token for test user
    const testUserJwtPayload = await callFunction<{ userId: string }, { token: string; expiresAt: number }>(
      'checkUserForEditing',
      {
        userId: sha512.sha512(getCurrentUser()?.uid ?? ''),
      },
    );

    // Add user 1 to waiting then accept user 1 and add user 2 to waiting
    {
      await callFunction<{ userId: string; firstName: string; lastName: string }, void>(
        'addUserToWaitingForRegistrationForEditing',
        {
          userId: user1.id,
          firstName: user1.name.first,
          lastName: user1.name.last,
        },
      );
      await callFunction<{ userId: string; acceptDecline: 'accept' | 'decline'; jsonWebToken: string }, void>(
        'acceptDeclineUserWaitingForRegistrationForEditing',
        {
          userId: user1.id,
          acceptDecline: 'accept',
          jsonWebToken: testUserJwtPayload.token,
        },
      );
      await callFunction<{ userId: string; firstName: string; lastName: string }, void>(
        'addUserToWaitingForRegistrationForEditing',
        {
          userId: user2.id,
          firstName: user2.name.first,
          lastName: user2.name.last,
        },
      );
    }

    // Check user 1 to be authorized, user 2 and 3 to be unauthorized
    {
      const jwtPayload = await callFunction<{ userId: string }, { token: string; expiresAt: number }>(
        'checkUserForEditing',
        {
          userId: user1.id,
        },
      );
      expect(new Date(jwtPayload.expiresAt)).to.be.greaterThanOrEqual(new Date());
      const decodedToken = jwt.verify(jwtPayload.token, jwtPublicRsaKey) as { userId: string; expiresAt: number };
      expect(decodedToken.expiresAt).to.be.equal(jwtPayload.expiresAt);
      expect(decodedToken.userId).to.be.equal(user1.id);
    }
    {
      let error: Error | undefined = undefined;
      try {
        await callFunction<{ userId: string }, { token: string; expiresAt: number }>('checkUserForEditing', {
          userId: user2.id,
        });
      } catch (err) {
        error = err as any;
      }
      expect(error).not.to.be.undefined;
      expect(error).to.be.an('Error');
      expect(error?.message).to.be.equal("User isn't authorized to edit website.");
    }
    {
      let error: Error | undefined = undefined;
      try {
        await callFunction<{ userId: string }, { token: string; expiresAt: number }>('checkUserForEditing', {
          userId: user3.id,
        });
      } catch (err) {
        error = err as any;
      }
      expect(error).not.to.be.undefined;
      expect(error).to.be.an('Error');
      expect(error?.message).to.be.equal("User isn't authorized to edit website.");
    }

    // Check user 2 to be waiting
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting.length).to.be.equal(1);
      expect(userWaiting[0]).to.be.deep.equal(user2);
    }

    // Add user 3 to waiting
    {
      await callFunction<{ userId: string; firstName: string; lastName: string }, void>(
        'addUserToWaitingForRegistrationForEditing',
        {
          userId: user3.id,
          firstName: user3.name.first,
          lastName: user3.name.last,
        },
      );
    }

    // Check user 3 to be waiting
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting.length).to.be.equal(2);
      userWaiting.sort((a, b) => a.id.localeCompare(b.id));
      expect(userWaiting[0]).to.be.deep.equal(user3);
      expect(userWaiting[1]).to.be.deep.equal(user2);
    }

    // Accept user 2 waiting
    {
      await callFunction<{ userId: string; acceptDecline: 'accept' | 'decline'; jsonWebToken: string }, void>(
        'acceptDeclineUserWaitingForRegistrationForEditing',
        {
          userId: user2.id,
          acceptDecline: 'accept',
          jsonWebToken: testUserJwtPayload.token,
        },
      );
    }

    // Check user to be authorized
    {
      const jwtPayload = await callFunction<{ userId: string }, { token: string; expiresAt: number }>(
        'checkUserForEditing',
        {
          userId: user2.id,
        },
      );
      expect(new Date(jwtPayload.expiresAt)).to.be.greaterThanOrEqual(new Date());
      const decodedToken = jwt.verify(jwtPayload.token, jwtPublicRsaKey) as { userId: string; expiresAt: number };
      expect(decodedToken.expiresAt).to.be.equal(jwtPayload.expiresAt);
      expect(decodedToken.userId).to.be.equal(user2.id);
    }

    // Check user waiting
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting.length).to.be.equal(1);
      expect(userWaiting[0]).to.be.deep.equal(user3);
    }
  });

  it('not empty waiting, not empty editors, decline', async () => {
    const user1 = {
      id: sha512.sha512('test-id-1'),
      name: {
        first: 'test-first-name-1',
        last: 'test-last-name-1',
      },
    };
    const user2 = {
      id: sha512.sha512('test-id-2'),
      name: {
        first: 'test-first-name-2',
        last: 'test-last-name-2',
      },
    };
    const user3 = {
      id: sha512.sha512('test-id-3'),
      name: {
        first: 'test-first-name-3',
        last: 'test-last-name-3',
      },
    };

    // Get json web token for test user
    const testUserJwtPayload = await callFunction<{ userId: string }, { token: string; expiresAt: number }>(
      'checkUserForEditing',
      {
        userId: sha512.sha512(getCurrentUser()?.uid ?? ''),
      },
    );

    // Add user 1 to waiting then accept user 1 and add user 2 to waiting
    {
      await callFunction<{ userId: string; firstName: string; lastName: string }, void>(
        'addUserToWaitingForRegistrationForEditing',
        {
          userId: user1.id,
          firstName: user1.name.first,
          lastName: user1.name.last,
        },
      );
      await callFunction<{ userId: string; acceptDecline: 'accept' | 'decline'; jsonWebToken: string }, void>(
        'acceptDeclineUserWaitingForRegistrationForEditing',
        {
          userId: user1.id,
          acceptDecline: 'accept',
          jsonWebToken: testUserJwtPayload.token,
        },
      );
      await callFunction<{ userId: string; firstName: string; lastName: string }, void>(
        'addUserToWaitingForRegistrationForEditing',
        {
          userId: user2.id,
          firstName: user2.name.first,
          lastName: user2.name.last,
        },
      );
    }

    // Check user 1 to be authorized, user 2 and 3 to be unauthorized
    {
      const jwtPayload = await callFunction<{ userId: string }, { token: string; expiresAt: number }>(
        'checkUserForEditing',
        {
          userId: user1.id,
        },
      );
      expect(new Date(jwtPayload.expiresAt)).to.be.greaterThanOrEqual(new Date());
      const decodedToken = jwt.verify(jwtPayload.token, jwtPublicRsaKey) as { userId: string; expiresAt: number };
      expect(decodedToken.expiresAt).to.be.equal(jwtPayload.expiresAt);
      expect(decodedToken.userId).to.be.equal(user1.id);
    }
    {
      let error: Error | undefined = undefined;
      try {
        await callFunction<{ userId: string }, { token: string; expiresAt: number }>('checkUserForEditing', {
          userId: user2.id,
        });
      } catch (err) {
        error = err as any;
      }
      expect(error).not.to.be.undefined;
      expect(error).to.be.an('Error');
      expect(error?.message).to.be.equal("User isn't authorized to edit website.");
    }
    {
      let error: Error | undefined = undefined;
      try {
        await callFunction<{ userId: string }, { token: string; expiresAt: number }>('checkUserForEditing', {
          userId: user3.id,
        });
      } catch (err) {
        error = err as any;
      }
      expect(error).not.to.be.undefined;
      expect(error).to.be.an('Error');
      expect(error?.message).to.be.equal("User isn't authorized to edit website.");
    }

    // Check user 2 to be waiting
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting.length).to.be.equal(1);
      expect(userWaiting[0]).to.be.deep.equal(user2);
    }

    // Add user 3 to waiting
    {
      await callFunction<{ userId: string; firstName: string; lastName: string }, void>(
        'addUserToWaitingForRegistrationForEditing',
        {
          userId: user3.id,
          firstName: user3.name.first,
          lastName: user3.name.last,
        },
      );
    }

    // Check user 3 to be waiting
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting.length).to.be.equal(2);
      userWaiting.sort((a, b) => a.id.localeCompare(b.id));
      expect(userWaiting[0]).to.be.deep.equal(user3);
      expect(userWaiting[1]).to.be.deep.equal(user2);
    }

    // Decline user 2 waiting
    {
      await callFunction<{ userId: string; acceptDecline: 'accept' | 'decline'; jsonWebToken: string }, void>(
        'acceptDeclineUserWaitingForRegistrationForEditing',
        {
          userId: user2.id,
          acceptDecline: 'decline',
          jsonWebToken: testUserJwtPayload.token,
        },
      );
    }

    // Check user to be unauthorized
    {
      let error: Error | undefined = undefined;
      try {
        await callFunction<{ userId: string }, { token: string; expiresAt: number }>('checkUserForEditing', {
          userId: user2.id,
        });
      } catch (err) {
        error = err as any;
      }
      expect(error).not.to.be.undefined;
      expect(error).to.be.an('Error');
      expect(error?.message).to.be.equal("User isn't authorized to edit website.");
    }

    // Check user waiting
    {
      const userWaiting = await callFunction<{ id: string; name: { first: string; last: string } }[]>(
        'getUsersToWaitingForRegistrationForEditing',
      );
      expect(userWaiting.length).to.be.equal(1);
      expect(userWaiting[0]).to.be.deep.equal(user3);
    }
  });
});
