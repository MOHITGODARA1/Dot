// The only shape of a user the API ever sends out. The password hash is never included.
function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    inviteCode: user.inviteCode,
    timezone: user.timezone,
    createdAt: user.createdAt,
  };
}

module.exports = serializeUser;
