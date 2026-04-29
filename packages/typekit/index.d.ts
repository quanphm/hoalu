export type WithUndefined<T> = { [K in keyof T]: T[K] | undefined };
