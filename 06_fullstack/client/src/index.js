import React from 'react';
import { render } from 'react-dom';
import './App.css';
import Books from './Books'
import Authors from './Authors'
import Recents from './Recents'
import BetterRecents from './BetterRecents'
import Navbar from './Navbar'
import { cache } from './cache'
import { ApolloClient, ApolloProvider, gql, split, HttpLink } from "@apollo/client";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
});

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);


const client = new ApolloClient({
  cache,
  link: splitLink
});



function App() {
  return (<>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="books" element={<Books />} />
        <Route path="authors" element={<Authors />} />
        <Route path="recents" element={<BetterRecents />} />
        {/* <Route path="recents" element={<Recents />} /> */}
      </Routes>
    </BrowserRouter>
  </>)
}



render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>, 
document.querySelector('#root'));

