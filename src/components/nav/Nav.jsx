import React from 'react';
import { Menu } from "lucide-react";
import { menuItems } from "./NavMenuItem";
import{ useAuth } from "../../hooks/useAuth"

import './Nav.scss';

const Nav = () => {

    const { logout } = useAuth();

    return (
        <div className="nav-container">
            <div className="nav-content">
                <div className="nav-logo">
                    Truck
                </div>

                <div className="nav-menu">
                    {menuItems.map((item) => (
                        <span key={item} className="nav-menu-item">
                            {item}
                        </span>
                    ))}
                </div>

                <div className="user-action">
                    <div className="signin" onClick={logout}>
                        Sign out
                    </div>
                </div>
                <div className="burguer-menu">
                    <Menu />
                </div>
            </div>
        </div>
    );
};

export default Nav;
