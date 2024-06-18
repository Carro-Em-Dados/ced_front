"use client";
import React, { useContext } from 'react';
import styles from './NavbarButtonLogout.module.scss';
import Button from '@/custom/button/Button';
import { ImExit } from "react-icons/im";
import { AuthContext } from '@/app/contexts/auth.context';
import { useRouter } from 'next/navigation';

function NavbarButtonLogout() {

    const { logout } = useContext(AuthContext);
    const router = useRouter();

    function handleClick() {
        logout();
        router.replace('/login');
    }

    const icon = () => {
        return (<ImExit className={styles.icon} />)
    }

    return (
        <div className={styles.buttonContainer}>
            <Button
                Icon={icon}
                text="Sair"
                click={handleClick} />
        </div>
    )
}

export default NavbarButtonLogout