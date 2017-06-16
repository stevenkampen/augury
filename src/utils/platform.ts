declare const chrome: any;
declare const browser: any;

export interface Platform {
  runtime: any;
  extension: {
    getURL: (string) => string;
  };
};

export const currentPlatform: Platform = typeof chrome === 'undefined' ? browser : chrome;