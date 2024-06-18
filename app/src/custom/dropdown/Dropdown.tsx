'use client'
import React, { useState } from 'react';
import styles from './Dropdown.module.scss'
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
    Button
} from "@nextui-org/react";

interface DropdownProps {
    options: {
        label: string,
        key: string
    }[],
    placeholder?: string,
    onChange: (key: React.Key) => any
    value: string | null
}

function DropdownComponent(props: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    function getLabel(key: string) {
        let label = "";
        props.options.forEach((i) => {
            if(i.key == key) label = i.label;
        })
        return label;
    }

    return (
        <Dropdown
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            >
            <DropdownTrigger>
                <Button
                    className={isOpen ? styles.activeButton : styles.button}
                    variant="bordered">{props.value ? getLabel(props.value) : props.placeholder}
                    <div style={{ width: "2.6em", height: "100%" }}>
                        <span className={isOpen ? styles.activevl : styles.vl} />
                        <div className={styles.caretContainer}>
                            <svg className={isOpen ? styles.activeCaret : styles.caret}
                                width="24" height="13" viewBox="0 0 24 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.6474L10.0009 10.6483C10.7819 11.4293 12.0483 11.4293 12.8293 10.6483L22.0625 1.4151" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </Button>
            </DropdownTrigger>
            <DropdownMenu className={styles.dropdownMenu}
            selectionMode="single"
            onAction={props.onChange}>
                {props.options.map((option) => {
                    return (
                        <DropdownItem key={option.key}>
                            <p className={styles.dropdownText}>{option.label}</p>
                        </DropdownItem>
                    )
                })}
            </DropdownMenu>
        </Dropdown>
    )
}

export default DropdownComponent