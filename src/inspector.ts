import {set, snakeCase} from 'lodash';
import * as yup from 'yup';
import {ObjectShape} from 'yup/lib/object';
import {SchemaObjectDescription, SchemaFieldDescription} from 'yup/lib/schema';

export const inspect = <T1, T2 extends yup.ObjectSchema<ObjectShape, T1>>(
  schema: T2
) => {
  return analyzeDesc(schema.describe());
};

export interface Descriptor {
  envVar: string;
  set: (obj: any, value: string) => void;
  desc?: string;
  path: string;
}

const analyzeDesc = (
  desc: SchemaObjectDescription,
  acc: Descriptor[] = [],
  prefix?: string,
  prefixPath?: string
) => {
  if (desc.type !== 'object') acc;
  for (const key in desc.fields) {
    const segment = snakeCase(key).toUpperCase();
    const variable = prefix ? `${prefix}_${segment}` : segment;
    const path = prefixPath ? `${prefixPath}.${key}` : key;
    if (desc.fields[key].type === 'array') {
      console.warn(`Arrays are not supported (${variable})`);
    }
    if (desc.fields[key].type !== 'object') {
      acc.push({
        envVar: variable,
        set: (obj: any, value: any) => {
          set(obj, path, value);
        },
        desc: (desc.fields[key] as any)?.meta?.desc,
        path,
      });
    } else {
      const updated = desc.fields[key] as SchemaObjectDescription;
      analyzeDesc(updated, acc, variable, path);
    }
  }
  return acc;
};
