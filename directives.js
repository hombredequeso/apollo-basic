
const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');

const logger = console;

// directive usage in schema is:
// 

//   directive @constvalue(
//     value: String = "CONSTVALUE"
//   ) on FIELD_DEFINITION

//   ...

//    myconst: String @constvalue(value: "Abc,123")

// And all it does is returns the constant value for the field.

function constValueDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const constValueDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (constValueDirective) {
        const constValue = constValueDirective['value'];
        const { resolve = defaultFieldResolver } = fieldConfig;
        return {
          ...fieldConfig,
          resolve: async function (source, args, context, info) {
            const result = await resolve(source, args, context, info)
            if (typeof result === 'string') {
              return `${result} : ${constValue}`
            }
            return result;
          }
        }
      }
    }
  });
}


// ============================================================================================================
const counter = {};
const incrementCounter =  (key) => {
  if (counter[key] === undefined) {
    counter[key] = 0;
  }
  counter[key] = counter[key] + 1;
}

function countValueDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const countValueDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (countValueDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        return {
          ...fieldConfig,
          resolve: function (source, args, context, info) {
            const countFieldKey = `${info.parentType.name}.${info.fieldName}`;
            incrementCounter(countFieldKey);
            logger.log('counter state:', {counter});
            return resolve(source, args, context, info);
          }
        }
      }
    }
  });
}

module.exports = { constValueDirectiveTransformer, countValueDirectiveTransformer}