

export default function Comment({ node }) {
    const { body } = node;

    return (<>
        <div className="comment">
            <p className="card-text">{body}</p>
        </div>
    </>)
}