class UserManager {
  static #users = [];

  static createUser({ username, email, password }) {
    // Check if the user already exists
    const exists = UserManager.#users.some((user) => user.email === email);
    if (exists) {
      throw new Error('User already exists');
    }

    const newUser = { username, email, password, isVerified: false };
    UserManager.#users.push(newUser);
    return newUser;
  }

  static verifyUser(email) {
    const userIndex = UserManager.#users.findIndex(
      (user) => user.email === email
    );

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    UserManager.#users[userIndex].isVerified = true;
  }

  static findUser(email) {
    const user = UserManager.#users.find((user) => user.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export { UserManager };
