Basic apollo graphql messing around.
Javascript level meddling, in-memory database.


Sample Query (which may, or may not still work :-) )
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

Try out the query in the [Apollo graphq sandbox explorer](https://studio.apollographql.com/sandbox/explorer)
