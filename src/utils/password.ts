import * as bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
