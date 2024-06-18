"use client";
import React, { useContext, useEffect } from 'react';
import styles from './NavbarButtonRegistration.module.scss';
import Button from '@/custom/button/Button';
import { useRouter } from 'next/navigation';
import { MdAssignmentAdd } from 'react-icons/md';

function NavbarButtonRegistration() {

    const router = useRouter();
    
  function handleClick() {
    router.push('/register');
  }

  const icon = () => {
    return (<MdAssignmentAdd className={styles.icon} />)
  }

  return (
    <div className={styles.buttonContainer}>
      <Button
        Icon={icon}
        text="Cadastrar"
        click={handleClick} />
    </div>
  )
}

export default NavbarButtonRegistration