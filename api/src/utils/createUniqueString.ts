export const createUniqueString = (): string =>
  ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
