const { z } = require('zod');

const email = z
  .string({ required_error: 'Please enter your email address.' })
  .trim()
  .toLowerCase()
  .email('Please enter a valid email address.')
  .max(254);

// bcrypt only uses the first 72 bytes, so we cap the length there.
const newPassword = z
  .string({ required_error: 'Please choose a password.' })
  .min(8, 'Your password needs at least 8 characters.') // AUTH-02
  .max(72, 'Your password can be at most 72 characters.');

const name = z
  .string({ required_error: 'Please tell us your name.' })
  .trim()
  .min(1, 'Please tell us your name.')
  .max(40, 'Your name can be at most 40 characters.');

const timezone = z.string().refine((tz) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}, 'That time zone is not recognised.');

const register = z.object({ name, email, password: newPassword, timezone: timezone.optional() });

const login = z.object({
  email,
  password: z.string({ required_error: 'Please enter your password.' }).min(1, 'Please enter your password.'),
});

const refreshToken = z.object({
  refreshToken: z.string({ required_error: 'refreshToken is required.' }).min(1),
});

const updateMe = z
  .object({ name: name.optional(), timezone: timezone.optional() })
  .refine((body) => body.name !== undefined || body.timezone !== undefined, {
    message: 'Send a name or a timezone to update.',
  });

module.exports = { register, login, refreshToken, updateMe };
