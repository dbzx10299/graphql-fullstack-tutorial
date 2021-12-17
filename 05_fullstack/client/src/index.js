import React from 'react';
import { render } from 'react-dom';
import './App.css';
import BookCards from './BookCards'
import AuthorCards from './AuthorCards'
import Navbar from './Navbar'
import { cache } from './cache'
import { ApolloClient, ApolloProvider, gql } from "@apollo/client";
import { BrowserRouter, Route, Routes } from 'react-router-dom';


const client = new ApolloClient({
  cache,
  uri: 'http://localhost:4000'
})

// check the console to see how to work with query in code

// client
//   .query({
//     query: gql`
//       query getBook {
//         book(id: "61a4c9be8c09f619c303249a") {
//           title 
//           id 
//         }
//       }
//     `
//   })
//   .then(result => console.log('single book: ', result));

// client
//   .query({
//     query: gql`
//       query getBooks {
//         books(first: 3) {
//           pageInfo {
//             hasPreviousPage
//             hasNextPage
//           }
//           edges {
//             node {
//               title
//               id 
//               author {
//                 name
//                 id
//               }
//             }
//           }
//         }
//       }
//     `
//   })
//   .then(result => console.log('many books: ', result));



function App() {
  return (<>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="books" element={<BookCards />} />
        <Route path="authors" element={<AuthorCards />} />
      </Routes>
    </BrowserRouter>
    {/* <AuthorCards /> */}
    {/* <BookCards /> */}
  </>)
}



render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>, 
document.querySelector('#root'));

