import Comment from './Comment'
import CommentForm from './CommentForm'
import { useQuery, gql } from "@apollo/client";

const GET_COMMENTS = gql`
    query ($id: String!, $first: Int!, $after: String) {
        post(id: $id) {
            comments(first: $first, after: $after) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
                edges {
                    node {
                        body
                        postId
                    }
                }
            }
        }
    }
`;

export const Post = ({ node }) => {
    const { id, body } = node;
    const { data, loading, error, fetchMore } = useQuery(GET_COMMENTS, { variables: { id: id, first: 2 }})

    return (
        <div className="card">
            <h4 className="card-text">{body}</h4>
            <p className="card-text">
                <div className="comment-wrapper">
                    {data?.post?.comments?.edges.map(({ node }) => (
                        <Comment key={node.id} node={node} />
                    ))}
                </div>
            </p> 

            {data?.post?.comments?.pageInfo?.hasNextPage && (
                <button className="btn secondary"
                    onClick={() => {
                        fetchMore({
                            variables: {
                                first: 2,
                                after: data?.post?.comments.pageInfo.endCursor
                            }
                        })
                    }}
            >load more</button>  
        )}

            <CommentForm id={id}/>
        </div>
    )
}