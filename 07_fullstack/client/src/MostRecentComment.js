

export default function MostRecentComment({ node, subscribeToNewComments }) {
    const { body } = node;

    return (<>
        <div className="comment">
            <h6 className="card-text">{body}</h6>
        </div>
    </>)
}