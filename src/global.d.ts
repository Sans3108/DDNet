declare global {
  /**
   * Deep Required type
   *
   * @internal
   */
  type DeepRequired<T extends object> = Required<{
    [P in keyof T]: T[P] extends object | undefined ? DeepRequired<Required<T[P]>> : T[P];
  }>;
}

export {};
