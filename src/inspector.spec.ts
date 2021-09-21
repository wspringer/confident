import * as yup from 'yup';
import {inspect} from './inspector';

describe('meta', () => {
  it('should allow you to get the meta data', () => {
    const schema = yup.object().shape({
      port: yup.number().integer().meta({desc: 'The port number'}),
      name: yup.string().meta({desc: 'The name'}),
    });
    const descriptors = inspect(schema);
    expect(descriptors).toMatchSnapshot();
  });

  it('should allow you to set object data', () => {
    const schema = yup.object().shape({
      port: yup.number().integer().meta({desc: 'The port number'}),
      name: yup.string().meta({desc: 'The name'}),
    });
    const descriptors = inspect(schema);
    const obj = {};
    descriptors[0].set(obj, '12');
    expect(obj).toMatchSnapshot();
  });

  it('should allow you to set nested object data', () => {
    const schema = yup.object().shape({
      sf: yup.object().shape({
        port: yup.number().integer().meta({desc: 'The port number'}),
      }),
    });
    const descriptors = inspect(schema);
    const obj = {};
    descriptors[0].set(obj, '12');
    expect(descriptors[0].envVar).toEqual('SF_PORT');
    expect(obj).toMatchSnapshot();
  });
});
