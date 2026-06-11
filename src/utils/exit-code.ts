export const EXIT_CODE = {
  passed: 0,
  validationFailed: 1,
  systemError: 2
} as const;

export type ExitCode = (typeof EXIT_CODE)[keyof typeof EXIT_CODE];
