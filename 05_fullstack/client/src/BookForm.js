import { gql, useMutation } from '@apollo/client';
import { useState } from 'react'

// Define mutation
const ADD_BOOK  = gql`
    mutation($title: String!, $authorId: String!) {
        addBook(title: $title, authorId: $authorId) {
            title 
            authorId
        }
    }
`;

export default function BookForm() {
    const [ title, setTitle ] = useState("")
    const [ authorId, setAuthorId ] = useState("")
    const [addBook, { data, loading, error }] = useMutation(ADD_BOOK);

    if (loading) return <h3>Submitting...</h3>
    if (error) return `Submission error: ${error.message}`

    return (
        <form className="app-form"
          onSubmit={e => {
              e.preventDefault();
              addBook({ variables: {
                  title,
                  authorId
              }})
              setTitle("")
              setAuthorId("")
          }} 
        >
            <div className="form-header">Add a book</div>

            <label className="f-label">
                <span>Book Title</span>
            </label>
            <div className="f-field-wrapper">
                <input className="f-input" onChange={e => setTitle(e.target.value)} required type="text" name="title" value={title} placeholder="Book Title" />
            </div>

            <label className="f-label">
                <span>Author ID</span>
            </label>
            <div className="f-field-wrapper">
                <input className="f-input" onChange={e => setAuthorId(e.target.value)} type="text" name="authorId" value={authorId} placeholder="Author ID" />
            </div>

            <button className="login-btn app-btn" type="submit">Add</button>
        </form>
    )
}
