import {loaderFrom, LoaderError} from './loader';
import * as yup from 'yup';
import chalk from 'chalk';

// Forcing chalk to produce colors
chalk.level = 2;

const schema = yup.object({
  path: yup.string().required().meta({
    desc: 'The path to search for executables',
  }),
  zzz: yup.number().integer(),
});

describe('the configuration solution', () => {
  const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

  afterEach(() => {
    consoleInfoSpy.mockClear();
    consoleErrorSpy.mockClear();
    processExitSpy.mockClear();
  });

  afterAll(() => {
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should allow you grab the configuration', () => {
    const loader = loaderFrom(schema);
    const config = loader.load();
    expect(config.path).not.toEqual('');
  });

  it('should allow you to rely on defaults', () => {
    const loader = loaderFrom(schema);
    const config = loader.load({zzz: 2});
    expect(config.zzz).toEqual(2);
  });

  it('should allow you to print usage', () => {
    const loader = loaderFrom(schema);
    loader.printUsage();
    expect(consoleInfoSpy).toBeCalledTimes(1);
    expect(consoleInfoSpy.mock.calls[0][0]).toMatchSnapshot();
  });

  it('should inform you about schema violations', () => {
    const loader = loaderFrom(
      yup.object({
        zzz: yup.object({yyy: yup.number().required()}),
      })
    );
    expect(() => loader.load()).toThrow(LoaderError);
    expect(() => loader.load()).toThrow('zzz.yyy is a required field');
  });

  it('should print relevant messages', () => {
    const loader = loaderFrom(
      yup.object({
        zzz: yup.object({yyy: yup.number().required()}),
      })
    );
    loader.loadOrFail();
    expect(processExitSpy).toBeCalled();
    expect(processExitSpy.mock.calls[0][0]).toEqual(1);
    expect(consoleErrorSpy).toBeCalledTimes(2);
    expect(consoleErrorSpy.mock.calls[0][0]).toEqual(
      chalk.red('Failed to load configuration; zzz.yyy is a required field')
    );
    expect(consoleErrorSpy.mock.calls[1][0]).toEqual(
      'Consider checking the value of the ZZZ_YYY environment variable'
    );
  });
});
