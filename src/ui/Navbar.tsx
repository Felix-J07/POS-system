import { Link } from 'react-router-dom';
import './static/Navbar.css';
import { House, PackageOpen, ChartLine, Settings } from 'lucide-react';

// React functional component for the navigation bar
// Contains React links to different pages in the app
// HTML code gotten from codepen along with the css code (https://codepen.io/onediv/pen/WNOdMWw)
function Navbar() {
    return (
        <nav className="navbar">
            <ul className="navbar__menu">
                <li id="home" className="navbar__item">
                    <div className="navbar__link">
                        <Link to="">
                            <House color="black" />
                            <span>Bestillingsside</span>
                        </Link>
                    </div>
                </li>
                <li id="storage" className="navbar__item">
                    <div className="navbar__link">
                        <Link to="/storage">
                            <PackageOpen color="black" />
                            <span>Lager</span>
                        </Link>
                    </div>
                </li>
                <li className="navbar__item">
                    <div id="statistics" className="navbar__link">
                        <Link to="/statistics">
                            <ChartLine color="black" />
                            <span>Statistik</span>
                        </Link>
                    </div>        
                </li>
                <li className="navbar__item">
                    <div id="settings" className="navbar__link">
                        <Link to="/settings">
                            <Settings color="black" />
                            <span>Indstillinger</span>
                        </Link>
                    </div>        
                </li>
            </ul>
        </nav>
    )
}

export default Navbar;