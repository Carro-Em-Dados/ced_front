import React from 'react'
import styles from './customCalendar.module.scss'
import clsx from 'clsx'

function CustomCalendar() {
    return (
        <div className={styles.calendarContainer}>
            <div className={styles.titleContainer}>
                <h2 className={styles.calendarTitle}>Fevereiro</h2>
                <button className={styles.yearButton}>
                    <h2 className={clsx(styles.calendarTitle, styles.calendarTitleYear)}>2024</h2>
                    <div className={styles.caretContainer}>
                        <svg width="2em" height="1.5em" viewBox="0 0 36 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 19L4 10.5L13 2" stroke="#B0B0B0" strokeWidth="5" />
                            <path d="M23 19L32 10.5L23 2" stroke="#B0B0B0" strokeWidth="5" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    )
}

export default CustomCalendar