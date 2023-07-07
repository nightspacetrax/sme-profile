import * as path from 'path';

export const rootDir = path.dirname(process.mainModule.filename);
export const publicDir = path.join(
  path.dirname(process.mainModule.filename).split(path.sep).slice(0, -1).join(path.sep),
  'public'
);