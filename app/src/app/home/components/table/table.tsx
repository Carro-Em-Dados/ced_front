"use client"
import React from 'react'
import styles from './table.module.scss'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";

interface CustomTableProps {
    data: any[]
}

function CustomTable(props: CustomTableProps) {
    return (
        <Table aria-label="Maintenance info table" className={styles.table}>
            <TableHeader className={styles.header}>
                <TableColumn>Cliente</TableColumn>
                <TableColumn>Veículo</TableColumn>
                <TableColumn>Manutenção</TableColumn>
                <TableColumn>Km atual</TableColumn>
                <TableColumn>Km limite</TableColumn>
                <TableColumn>Data limite</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>Agendamento</TableColumn>
            </TableHeader>
            <TableBody>
                {props.data.map((row, key) => (
                    <TableRow key={key}>
                        <TableCell className={styles.cell}>{row.client}</TableCell>
                        <TableCell className={styles.cell}>{row.vehicle}</TableCell>
                        <TableCell className={styles.cell}>{row.maintenance}</TableCell>
                        <TableCell className={styles.cell}>{row.km_current}</TableCell>
                        <TableCell className={styles.cell}>{row.km_threshold}</TableCell>
                        <TableCell className={styles.cell}>{row.date_threshold}</TableCell>
                        <TableCell className={styles.cell}>{row.status}</TableCell>
                        <TableCell className={styles.cell}>{row.appointment}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default CustomTable