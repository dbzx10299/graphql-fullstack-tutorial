import { gql, useQuery } from "@apollo/client";



export default function Comment({ node, subscribeToNewComments }) {
    const { body } = node;

    return (<>
        <div className="comment">
            <h6 className="card-text">{body}</h6>
        </div>
    </>)
}