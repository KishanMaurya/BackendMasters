import { sessionCookieOptions } from './session-cookies';

describe('sessionCookieOptions', () => {
  it('hides the session from scripts and public pages, whatever it is given', () => {
    expect(
      sessionCookieOptions({ path: '/', httpOnly: false, sameSite: 'none', maxAge: 60 }),
    ).toMatchObject({ path: '/admin', httpOnly: true, sameSite: 'lax', maxAge: 60 });
  });

  it('keeps the expiry used to delete a cookie', () => {
    expect(sessionCookieOptions({ maxAge: 0 }).maxAge).toBe(0);
  });
});
