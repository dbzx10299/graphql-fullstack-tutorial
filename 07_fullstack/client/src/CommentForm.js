import { gql, useMutation } from '@apollo/client';
import { useState } from 'react'

const ADD_COMMENT  = gql`
    mutation($body: String!, $postId: String!) {
        addComment(body: $body, postId: $postId) {
            body 
            postId
        }
    }
`;

export default function CommentForm({ id }) {
    const [ body, setBody ] = useState("")
    const [addComment, { data, loading, error }] = useMutation(ADD_COMMENT);

    if (loading) return <h3>Submitting...</h3>
    if (error) return `Submission error: ${error.message}`

    return (
        <form className="comment-form"
          onSubmit={e => {
              e.preventDefault();
              addComment({ variables: {
                  body,
                  postId: id
              }})
              setBody("")
          }} 
        >

            <div className="f-field-wrapper">
                {/* <input className="f-input" onChange={e => setBody(e.target.value)} required type="text" name="body" value={body} placeholder="add a comment" /> */}
                <textarea className="comment-text" onChange={e => setBody(e.target.value)} required type="text" name="body" placeholder="add a comment"></textarea>
            </div>

            <button className="login-btn btn primary" type="submit">Add Comment</button>
        </form>
    )
}
