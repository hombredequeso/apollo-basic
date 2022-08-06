const { ApolloServer, gql } = require('apollo-server');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');
const { defaultFieldResolver, graphql } = require('graphql');
const {parse, visit} = require('graphql')

const { visitor, getFieldListingVisitor } = require('./visitor.js')

const logger = console;

const {libraries, addresses, books, articles, authors, a, b, cs, widgets, extrasWidgetInfo } = require('./database.js')
const typeDefs = require('./schema.js')

const {constValueDirectiveTransformer, countValueDirectiveTransformer} = require('./directives.js')



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

// Build up the schema: 
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

        const query = x.request?.query;
        if (!query) return;
        const parsedQuery = parse(query);
        logger.log({parsedQuery});
        visit(parsedQuery, visitor);

        const currentPath = [];
        const allPaths = [];
        visit(parsedQuery, getFieldListingVisitor(currentPath, allPaths));
        logger.log('allPaths: ', JSON.stringify(allPaths));

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
