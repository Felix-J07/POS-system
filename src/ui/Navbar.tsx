import './static/Navbar.css';
import { House, PackageOpen, ChartLine, Settings } from 'lucide-react';

function Navbar() {
    return (
        <nav className="navbar">
            <ul className="navbar__menu">
                <li id="home" className="navbar__item">
                    <div className="navbar__link">
                        <a href="" target="_blank">
                            <House color="black" />
                            <span>Bestillingsside</span>
                        </a>
                    </div>
                </li>
                <li id="storage" className="navbar__item">
                    <div className="navbar__link">
                        <a href="/storage" target="_blank">
                            <PackageOpen color="black" />
                            <span>Lager</span>
                        </a>
                    </div>
                </li>
                <li className="navbar__item">
                    <div id="statistics" className="navbar__link">
                        <a href="/statistics" target="_blank">
                            <ChartLine color="black" />
                            <span>Statistik</span>
                        </a>
                    </div>        
                </li>
                <li className="navbar__item">
                    <div id="settings" className="navbar__link">
                        <a href="/settings" target="_blank">
                            <Settings color="black" />
                            <span>Indstillinger</span>
                        </a>
                    </div>        
                </li>
            </ul>
        </nav>
    )
}

export default Navbar;