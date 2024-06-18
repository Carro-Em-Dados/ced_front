"use client"
import React from 'react'
import styles from './DriverCard.module.scss'
import { IoPersonCircle } from "react-icons/io5";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import clsx from 'clsx';
import { FaRegTrashAlt } from "react-icons/fa";

interface DriverCardProps {
    name: string,
    email: string,
    birth?: any,
    age?: string,
    gender?: string,
    address?: string,
    commercialAddress?: string;
    phone?: string;
    cnh?: string;
}

function DriverCard(props: DriverCardProps) {

    const defaultContent =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

    const Content = () => {
        return (
            <div className={styles.contentContainer}>
                <div className={styles.cardsContainer}>
                    <div className={clsx(styles.card, styles.infoCard)}>
                        <h4 className={styles.cardTitle}>Dados</h4>
                        <div className={styles.row}>
                            <p className={styles.cardText}>Nome: {props.name}</p>
                        </div>
                        <div className={styles.row}>
                            <p className={styles.cardText}>Email: {props.email}</p>
                        </div>
                        {/* <div className={styles.row}>
                            <p className={styles.cardText}>Data de nascimento: {props.birth}</p>
                            <p className={styles.cardText}>Gênero: {props.gender}</p>
                            <p className={styles.cardText}>Idade: {props.age}</p>
                        </div>
                        <div className={styles.row}>
                            <p className={styles.cardText}>Endereço residencial: {props.address}</p>
                            {props.commercialAddress ?
                                <p className={styles.cardText}>Endereço comercial: {props.commercialAddress}</p> :
                                <></>}
                        </div>
                        <div className={styles.row}>
                            <p className={styles.cardText}>Telefone: {props.phone}</p>
                        </div>
                        <div className={styles.row}>
                            <p className={styles.cardText}>CNH: {props.cnh}</p>
                        </div> */}
                    </div>
                    <div className={clsx(styles.card, styles.vehiclesCard)}>
                        <h4 className={styles.cardTitle}>Carros</h4>
                    </div>
                </div>
                <div className={styles.contentFooter}>
                    <div className={styles.deleteBtnWrap}>
                        <button className={styles.deleteBtn}><FaRegTrashAlt className={styles.trashIcon} /></button>
                    </div>
                    <div className={styles.addVehicleBtnWrap}>
                        <Button color="success" className={styles.addVehicleBtn} onPress={()=>{}}>
                            Adicionar carro
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{margin: "0.5em 0"}}>
            <Accordion className={styles.accordion}>
                <AccordionItem key="1" title={`${props.name}`} className={styles.item}
                    startContent={
                        <IoPersonCircle className={styles.personIcon} />
                    }>
                    <Content />
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default DriverCard