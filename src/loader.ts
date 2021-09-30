import {inspect} from './inspector';
import * as yup from 'yup';
import {ObjectShape} from 'yup/lib/object';
import {CustomError} from 'ts-custom-error';
import chalk from 'chalk';

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export interface Loader<T1, T2 extends yup.ObjectSchema<ObjectShape, T1>> {
  load: (defaultOptions?: RecursivePartial<yup.Asserts<T2>>) => yup.Asserts<T2>;
  loadOrFail: (
    defaultOptions?: RecursivePartial<yup.Asserts<T2>>
  ) => yup.Asserts<T2>;
  printUsage: () => void;
}

export class LoaderError extends CustomError {
  public constructor(msg: string, public envVar?: string) {
    super(msg);
  }
}

export const loaderFrom = <T1, T2 extends yup.ObjectSchema<ObjectShape, T1>>(
  schema: T2
): Loader<T1, T2> => {
  const entries = inspect(schema);

  const load = (
    defaultOptions?: RecursivePartial<yup.Asserts<T2>>
  ): yup.Asserts<T2> => {
    const options = defaultOptions || {};
    entries.forEach(entry => {
      const value = process.env[entry.envVar];
      if (value) entry.set(options, value);
    });
    try {
      return schema.validateSync(options);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const path = err.path;
        const name = entries.find(entry => entry.path === path)?.envVar;
        if (name) {
          throw new LoaderError(err.message, name);
        } else {
          throw new LoaderError(err.message);
        }
      }
      throw err;
    }
  };

  const loadOrFail = (defaultOptions?: RecursivePartial<yup.Asserts<T2>>) => {
    try {
      return load(defaultOptions);
    } catch (err) {
      if (err instanceof LoaderError) {
        console.error(
          chalk.red(`Failed to load configuration; ${err.message}`)
        );
        console.error(
          `Consider checking the value of the ${err.envVar} environment variable`
        );
      } else if (err instanceof Error) {
        console.error(chalk.red(err.message));
      }
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
  };

  const printUsage = () => {
    const usage = entries
      .map(entry =>
        `
${chalk.blue(entry.envVar)}
${entry.desc || ''}
    `.trim()
      )
      .join('\n\n');
    console.info(usage);
  };

  return {
    load,
    loadOrFail,
    printUsage,
  };
};
