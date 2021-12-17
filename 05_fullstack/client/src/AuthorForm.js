import { gql, useMutation } from '@apollo/client';
import { useState } from 'react'

// Define mutation
const ADD_AUTHOR  = gql`
    mutation($name: String!) {
        addAuthor(name: $name) {
            name
        }
    }
`;

export default function AuthorForm() {
    const [ name, setName ] = useState("")
    const [addAuthor, { data, loading, error }] = useMutation(ADD_AUTHOR);

    if (loading) return <h3>Submitting...</h3>
    if (error) return `Submission error: ${error.message}`

    return (
        <form className="app-form"
          onSubmit={e => {
              e.preventDefault();
              addAuthor({ variables: {
                name
              }})
              setName("")
          }} 
        >
            <div className="form-header">Add an author</div>

            <label className="f-label">
                <span>Author Name</span>
            </label>
            <div className="f-field-wrapper">
                <input className="f-input" onChange={e => setName(e.target.value)} required type="text" name="title" value={name} placeholder="Author Name" />
            </div>

            <button className="login-btn app-btn" type="submit">Add</button>
        </form>
    )
}
