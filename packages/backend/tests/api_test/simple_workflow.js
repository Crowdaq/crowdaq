import { createHttpLink } from "apollo-link-http";
const link = createHttpLink({ uri: "http://127.0.0.1:4000/graphql" });
import ApolloClient from "apollo-client";

const client = new ApolloClient({
    link: createHttpLink({ uri: "/graphql" }),
    cache: new InMemoryCache()
});

client.query({
    query: `
        
    `,
    context: {
        // example of setting the headers with context per operation
        headers: {
            special: "Special header value"
        }
    }
});
