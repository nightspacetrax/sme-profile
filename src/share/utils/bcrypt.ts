import * as bcrypt from 'bcryptjs';

export const bcryptPassword = (pass: string): string => {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pass, salt);
};

export const bcryptCompare = (pass: string, hex: string) => {
  return bcrypt.compareSync(pass, hex);
};
