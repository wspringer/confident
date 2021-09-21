# README

A small library to load configuration from environment variables, mapping them to a JSON data structure. The data structure is defined by yup. The Loader will automatically type the resulting config correctly, matching the data structure defined by yup.

## Usage

```typescript
import { Loader } from 'confident';

const loader = Loader(
  yup.object({
    path: yup.string().required().meta({
      desc: 'The path to search for executables',
    }),
    sf: yup.object({
      key: yup.string().required().meta({
        desc: 'The SalesForce API key to use',
      }),
    }),
  })
);
```

Perhaps goldplating, but it allows you to print usage, printing all environment variables defined and their description, when present.

```typescript
loader.printUsage();
```

Resulting into:

```shell
PATH
The path to search for executables

SF_KEY
The SalesForce API key to use
```

But the main use case obvious is this:

```typescript
const config = loader.loadOrFail();
```

Which in this case (since `SF_KEY` is not defined) will result in:

```shell
Failed to load configuration; sf.key is a required field
Consider checking the value of the SF_KEY environment variable
```

If that environment variable would have been defined, it would have returned a configuration object with all the values set according to expectation.

You can pass in a default configuration object that must comply with the (partial) data structure defined by yup. (And the compiler will you if it isn't.)

```typescript
const config = loader.loadOrFail({sf: { key: 'foo' } });
```

In the above case, the configuration will load, since the loader will rely on the default value 'foo' in case `SF_KEY` isn't set.
