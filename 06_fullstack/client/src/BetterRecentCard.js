import Loading from "./Loading"
import { useEffect } from 'react';
import Modal from "./Modal"



export default function RecentCard({ data, loading, subscribeToNewBooks }) {
    

    useEffect(() => {
        subscribeToNewBooks();
        console.log('done mounting')
    }, []);

    if (loading) return <Modal />

    return (<>
        { data?.books?.edges.slice(0).reverse().map(({ node }) => (
            <div key={node.id} className="card">
                <h4 className="card-text">{node.title}</h4>
                <h5 className="card-text">{node.author.name}</h5>
            </div>
        ))}
    </>)


}