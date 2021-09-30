import {Loader} from '.';
import * as yup from 'yup';

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
    port: yup.number().integer().meta({desc: 'The port number to listen to'}),
  })
);

// loader.loadOrFail();

const config = loader.loadOrFail();
console.info(typeof config.port);
