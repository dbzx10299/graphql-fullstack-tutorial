import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <div className="header">
            <h3 className="app-heading">Fullstack Apollo App</h3>
            <div className="links">
                <Link to="/posts" className="nav-links">Posts</Link>
                <Link to="/recents" className="nav-links">Most recent</Link>
            </div>
        </div>
    )
}