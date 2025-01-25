import React from 'react';
import { Link } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'List' },
    { path: '/api', label: 'API' },
    { path: '/settings', label: 'Settings' }
];

function Navbar() {
    return (
        <nav className="w-64 p-4">
            <ul className="flex flex-col">
                {navItems.map((item, index) => (
                    <li className='m-0' key={index}>
                        <Link to={item.path} className="block p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 text-gray-800 dark:text-dark-text">
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Navbar;
