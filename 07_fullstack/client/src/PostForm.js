import { gql, useMutation } from '@apollo/client';
import { useState } from 'react'


const ADD_POST  = gql`
    mutation ($body: String!) {
        addPost(body: $body) {
            body
        }
    }
`;

export default function PostForm() {
    const [ body, setBody ] = useState("")
    const [addPost, { data, loading, error }] = useMutation(ADD_POST);

    if (loading) return <h3>Submitting...</h3>
    if (error) return `Submission error: ${error.message}`

    return (
        <form className="app-form"
          onSubmit={e => {
              e.preventDefault();
              addPost({ variables: {
                body
              }})
              setBody("")
          }} 
        >
            <div className="form-header">Add a post</div>

            <label className="f-label">
                <span>Post text</span>
            </label>
            <div className="f-field-wrapper">
                <input className="f-input" onChange={e => setBody(e.target.value)} required type="text" name="body" value={body} placeholder="enter your post" />
            </div>

            <button className="login-btn btn primary" type="submit">Add</button>
        </form>
    )
}
