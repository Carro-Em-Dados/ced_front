"use client"
import React from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from "react-chartjs-2";

const PENDING_COLOR = '#D3C544';
const OVERDUE_COLOR = '#B73F25';
const CRITICAL_COLOR = '#2D2F2D';

interface CustomChartProps {

}

function CustomChart(props: CustomChartProps) {
    ChartJS.register(ArcElement, Tooltip, Legend);


    const data = {
        labels: [
            "Próximas",
            "Vencidas",
            "Críticas"
        ],
        datasets: [{
            data: [100, 100, 100],
            backgroundColor: [PENDING_COLOR, OVERDUE_COLOR, CRITICAL_COLOR],
            borderColor: ['transparent', 'transparent', 'transparent'],
        }]
    }

    return (
        <Doughnut data={data} options={{
            cutout: "85%",
            layout: {
            },
            plugins: {
                legend: {
                    position: "bottom", 
                    align: "start", 
                    title: {
                        display: true,
                    },
                    labels: {
                        boxWidth: 10, 
                        boxHeight: 10,
                        usePointStyle: true, 
                        pointStyle: "circle",
                    }
                }
            }
        }} />
    )
}

export default CustomChart