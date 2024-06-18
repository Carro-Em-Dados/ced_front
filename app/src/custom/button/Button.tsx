"use client";
import React, { ComponentType, ReactElement, ReactNode } from 'react';
import styles from './Button.module.scss'

interface ButtonProps {
    text: string;
    click: any;
    customStyles?: any;
    Icon?: ComponentType;
}

const Button = (props: ButtonProps) => {

    const Icon = props.Icon!;

    return (
        <button
            style={props.customStyles ? props.customStyles : {}}
            className={styles.customButton}
            onClick={props.click}>
            {props.Icon ? <Icon /> : <></>}
            <p className={styles.text}>
                {props.text}
            </p>
        </button>
    )
}

export default Button