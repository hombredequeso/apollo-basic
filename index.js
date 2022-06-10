const { ApolloServer, gql } = require('apollo-server');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');
const { defaultFieldResolver } = require('graphql');

const logger = console;
// const logger = {
//   log: () => {},
//   error: () => {},
//   debug: () => {},
//   info: () => {}
//   warn: () => {}
// };

const libraries = [
  {
    branch: 'downtown'
  },
  {
    branch: 'riverside'
  },
];

const addresses = [
  {
    title: 'downtown',
    address: '1 nowheres ville'
  },
  {
    title: 'riverside',
    address: '1 river rv'
  },
  {
    title: 'J.K. Rowling',
    address: '1 rowling st'
  }
]

// The branch field of a book indicates which library has it in stock
const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    branch: 'riverside'
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
    branch: 'downtown'
  },
];

const articles = [
  {
    title: 'Harry and the Harriets',
    periodical: 'Witches and Wizards',
    writer: 'J.K. Rowling',
    branch: 'riverside'
  },
  {
    title: 'Harry and the Harriets Pt 2',
    periodical: 'Witches and Wizards',
    writer: 'J.K. Rowling',
    branch: 'riverside'
  }
]

const authors = [
  {
    name: 'J.K. Rowling',
    country: 'Great Britain'
  },
  {
    name: 'Michael Crichton',
    country: 'USA'
  }
]

const a = {
    id: "aId",
    description: "This is an a",
    cOtherId: "999",
}

const b = {
    id: "bId",
    name: "name of b",
    cId: "888"
}

const cs = [
  {
    id: "888",
    description: "instance 888"
  },
  {
    id: "999",
    description: "instance 999"
  },
]


// const addresses = [
//   {
//     title: 'downtown',
//     address: '1 nowheres ville'
//   },

// Schema definition
const typeDefs = gql`
  directive @constvalue(
    value: String = "CONSTVALUE"
  ) on FIELD_DEFINITION

  type Address {
    title: String
    address: String
  }

  type Article {
    title: String
    periodical: String
    writer: Author
  }

# A library has a branch and books
  type Library {
    branch: String!
    details: LibraryDetails
    books: [Book!]
    articles: [Article!],
    address: Address
  }

  type LibraryDetails {
    description: String
  }

  # A book has a title and author
  type Book {
    title: String!
    author: Author!
  }

  # An author has a name
  type Author {
    name: String!
    country: String
    address: Address
  }

  type AType {
    id: String!
    description: String
    c: CType
    cs: [CType]
    x: String
  }

  type BType {
    id: String!
    name: String
    c: CType
  }

  type CType {
    id: String!
    description: String
  }

  interface Error {
    description: String
  }

  type GeneralError implements Error {
    description: String
  }

  type SpecificError implements Error {
    description: String
    extraDetail: String
  }

  type Thing1 {
    description: String
  }

  type Thing2 {
    description: String
  }

  type Things {
    thing1: Thing1
    thing2: Thing2
  }

  type Widget {
    id: String! @count
    description: String!
    myconst: String @constvalue(value: "Abc,123")
  }

  type ExtraWidgetStuff {
    extras: String!
    moreExtras: String!
  }

  type WidgetWrapper {
    widget: Widget!
    extras: ExtraWidgetStuff
  }


  # Queries can fetch a list of libraries
  type Query {
    widgets: [WidgetWrapper!]!
    libraries: [Library]
    a: AType
    as: [AType]
    b: BType
    errors: [Error]
    things: Things
  }
`;


const widgets = [
  {
    id: "111",
    description: "widget 111"
  },
  {
    id: "222",
    description: "widget 222"
  }
]

const extrasWidgetInfo = [
  {
    id: "111",
    description: "widget 111 extras"
  },
  {
    id: "222",
    description: "widget 222 extras"
  }
];


const resolvers = {
  Query: {
    widgets() {
      return widgets.map((w) => ({
        widget: w,
        extras: { id: w.id }
      }));
    },
    things() {
      return {
        thing1: { id: 1 },
        thing2: { id: 2 },
      };
    },
    libraries() {
      return libraries;
    },
    a(parent, args, context, info) {
      // console.log(`Query.a resolver, parent = ${JSON.stringify(parent)}`);
      return {
        id: "aId",
        description: "This is an a",
        cIdFromA: "999",
      };
    },
    as() {
      return [a];
    },
    b() {
      // console.log("Query.b resolver");
      return {
        id: "bId",
        name: "name of b",
        cIdFromB: "888",
      };
    },
    errors(parent, args, context, info) {
      return [
        {
          type: "general",
          description: "GeneralErrorDescription",
        },
        {
          type: "specific",
          description: "SpecificErrorDescription",
          extraDetail: "SpecificErrorExtraDetail",
        },
      ];
    },
  },
  Widget: {
    id() {
      return "dummyid";
    },
    description() {
      return "dummy description";
    },
    myconst() {
      return "hello there"
    }
  },
  ExtraWidgetStuff: {
    extras(parent, args, context) {
      return context.data.cache(
        `getExtrasWidgetInfo:${parent.id}`,
        () => getExtrasWidgetInfo(parent.id))
        .then((d) => d.extras);
    },
    moreExtras(parent, args, context) {
      return context.data.cache(
        `getExtrasWidgetInfo:${parent.id}`,
        () => getExtrasWidgetInfo(parent.id))
        .then((d) => d.moreExtras);
    },
  },
  Thing1: {
    description() {
      // console.log("executing Thing1 resolver");
      throw new Exception("oops...");
      return "thing1 desc" + new Date();
    },
  },
  Thing2: {
    description() {
      // console.log("executing Thing2 resolver");
      return "thing2 desc: " + new Date().toISOString();
    },
  },
  Error: {
    __resolveType(error, context, info) {
      if (error.type === "specific") return "SpecificError";
      return "GeneralError";
    },
  },
  // GeneralError: {
  //   description() {return "GeneralErrorDescription";}
  // },
  // SpecificError: {
  //   description() {return "SpecificErrorDescription";},
  //   extraDetail() {return "SpecificErrorExtraDetail";}
  // },

  Library: {
    books(parent, args, context, info) {
      const bks = context.dataSources.books;
      return bks.filter((book) => book.branch === parent.branch);
    },
    articles(parent, _, context) {
      const articles = context.dataSources.articles;
      return articles.filter((a) => a.branch === parent.branch);
    },
    address(parent, _, context) {
      return {};
    },
    details() {
      return { description: "library details desc" };
    },
  },
  AType: {
    description() {
      return "description from AType.description";
    },
    // c() {
    //   return {cId: 99999};
    // },
    cs() {
      // console.log("AType.cs resolver");
      return [];
    },
    x() {
      return "some x val";
    },
  },
  CType: {
    id(parent, args, context, info) {
      // console.log("CType.id resolver");
      return "c id from CType.id";
    },
    description(parent, args, context, info) {
      // console.log("CType.description resolver");
      return `Id desc from CType.description: parent = ${JSON.stringify(
        parent
      )}`;
    },
  },

  // Book: {
  //   // The parent resolver (Library.books) returns an object with the
  //   // author's name in the "author" field. Return a JSON object containing
  //   // the name, because this field expects an object.
  //   author(parent, _, context) {
  //     const authorName = parent.author;
  //     const authorDs = context.dataSources.authors.find(a => a.name == authorName);
  //     return authorDs;

  //     // return {
  //     //   name: parent.author
  //     // };
  //   }
  // },

  Author: {
    name(parent, args, context, info) {
      const authorKey = parent;
      const authorDs = context.dataSources.authors.find(
        (a) => a.name == authorKey
      );
      return authorDs?.name;
    },
    country(parent, _, context) {
      const authorKey = parent;
      const authorDs = context.dataSources.authors.find(
        (a) => a.name == authorKey
      );
      return authorDs?.country;
    },
  },
  Address: {
    title(parent, args, context, info) {
      return "address title";
    },
    address(parent, _, context) {
      return "address country";
    },
  },
};

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

const getDataSources = () => ({
        libraries,
        books,
        authors,
        articles,
        a,
        b,
        cs
});

const getExtrasWidgetInfo = (id) => {
  const result = {
    id: id,
    extras: "promised extras for " + id,
    moreExtras: "more promised extras for " + id
  }
  // console.log("getExtrasWidgetInfo")

  return new Promise(function(resolve, reject){
    setTimeout(() => resolve(result), 1000);
  })
};


const getData = () => {
  const data = {};
  data.cache = (key, futureGet) => {
    data[key] = data[key] ?? futureGet();
    return data[key];
  }
  return data;
}
const countDirectiveTypeDefs = (directiveName) => gql`
  directive @${directiveName} on FIELD_DEFINITION
`;


let schema = makeExecutableSchema({
  typeDefs: [
    countDirectiveTypeDefs('count'),
    typeDefs
  ],
  resolvers
});

// Transform the schema by applying directive logic
schema = constValueDirectiveTransformer(schema, 'constvalue');
schema = countValueDirectiveTransformer(schema, 'count');

// Pass schema definition and resolvers to the
// ApolloServer constructor
const server = new ApolloServer(
  {
    schema,
    csrfPrevention: true,
    context: () => ({
      dataSources: getDataSources(),
      data: getData()
    }),
  plugins: [
    {
      async serverWillStart(x) {
        logger.log('Server starting up!!!!!!\n' + JSON.stringify(x, null , ' '));
      },
      async requestDidStart(x) {
        if (x?.request?.operationName === 'IntrospectionQuery') return;

        logger.log(`REQUEST DID START: ${x?.request?.operationName}`);
        // console.log(`${JSON.stringify(x, null, ' ')}`);
      }
    }
  ]
  });



// Launch the server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
