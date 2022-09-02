const { gql } = require('apollo-server');


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
    details: LibraryDetails!
    books: [Book!]
    articles: [Article!],
    address: Address
  }

  type LibraryDetails {
    description: String!
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

  # Company:

  type Company {
      id: String!
      name: String!
      description: String!
      reviews: [CompanyReview]
  }

  type CompanyReview {
      review: String!
  }

  # Queries can fetch a list of libraries
  type Query {
    widgets: [WidgetWrapper!]!
    libraries: [Library]!
    a: AType
    as: [AType]
    b: BType
    errors: [Error]
    things: Things

    company(id: String!): Company
  }
`;

module.exports = typeDefs;