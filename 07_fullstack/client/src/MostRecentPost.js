import Modal from "./Modal"
import { useEffect } from 'react';
import MostRecentComment from './MostRecentComment';

export default function MostRecentPost({ data, loading, subscribeToNewPosts }) {

    useEffect(() => {
        subscribeToNewPosts();
    }, []);

    if (loading) return <Modal />

    return (<>
        {data?.posts.edges.slice(0).reverse().map(({ node }) => 
            <div className="card">
                <h4 className="card-text">{node.body}</h4>
                {node.comments.edges.map(({ node }) => 
                    <MostRecentComment node={node} />
                )}
            </div>
        )}
    </>)
}