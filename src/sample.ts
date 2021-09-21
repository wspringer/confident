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
  })
);

// loader.loadOrFail();

const config = loader.loadOrFail();
