import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <div className="header">
            <h3 className="app-heading">Fullstack Apollo App</h3>
            <div className="links">
                <Link to="/books" className="nav-links">Books</Link>
                <Link to="/authors" className="nav-links">Authors</Link>
            </div>
        </div>
    )
}