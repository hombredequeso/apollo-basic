# Basic Apollo Graphql

A very simple, apollo graphql setup for learning purposes.

Features:
* As close to the metal as is reasonable.
* Javascript (i.e. not Typescript, which is what you may want to use for real)
* In memory database. 
* Liberal logging to the console.


Sample Query :
```
query TestQuery {
  libraries {
    branch
  }
  a {
    id
  }
  widgets {
    widget {
      id
      description
      myconst
    }
  }
}
```

```
curl --request POST \
    --header 'content-type: application/json' \
    --url http://localhost:4000/ \
    --data '{"query":"query GetCompanyData($companyId: String!) {\n company(id: $companyId) {\n   name\n   description\n   reviews {\n     review\n   }\n   }\n }","variables":{"companyId":"hombreDeQuesoInc"}}'
```


Try out the query in the [Apollo graphq sandbox explorer](https://studio.apollographql.com/sandbox/explorer)


Some helpful links:
* [GraphQL: Resolvers](https://www.graphql-tools.com/docs/resolvers)
* [Apollo GraphQL Resolvers](https://www.apollographql.com/docs/apollo-server/data/resolvers/)
* [GraphQL Resolvers: Best Practices](https://medium.com/paypal-tech/graphql-resolvers-best-practices-cd36fdbcef55)
* [GraphQL: Execution](https://graphql.org/learn/execution/)