"use client";
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

const PENDING_COLOR = "#D3C544";
const OVERDUE_COLOR = "#B73F25";
const CRITICAL_COLOR = "#2D2F2D";

interface CustomChartProps {
	chartData: {
		critical: number;
		upcoming: number;
		overdue: number;
	};
}

function CustomChart({ chartData }: CustomChartProps) {
	const [value, setValue] = useState(0);

	ChartJS.register(ArcElement, Tooltip, Legend);

	const data = {
		labels: ["Próximas", "Vencidas", "Críticas"],
		datasets: [
			{
				data: [chartData.upcoming, chartData.overdue, chartData.critical],
				backgroundColor: [PENDING_COLOR, OVERDUE_COLOR, CRITICAL_COLOR],
				borderColor: ["transparent", "transparent", "transparent"],
			},
		],
	};

	const handleHover = (event: any, chartElement: any) => {
		if (chartElement.length > 0) {
			const datasetIndex = chartElement[0].datasetIndex;
			const index = chartElement[0].index;
			const value = data.datasets[datasetIndex].data[index];
			const chartColor = data.datasets[datasetIndex].backgroundColor[index];
			setValue(value);
		}
	};

	useEffect(() => {
		setValue(0);
	}, [chartData]);

	return (
		<div className="relative">
			<Doughnut
				className="z-10"
				data={data}
				options={{
					cutout: "85%",
					onHover: handleHover,
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
							},
						},
						tooltip: {
							callbacks: {
								label: function (tooltipItem) {
									const dataset = tooltipItem.dataset;
									const total = dataset.data.reduce(
										(acc, value) => acc + value,
										0
									);
									const currentValue = dataset.data[tooltipItem.dataIndex];
									const percentage = ((currentValue / total) * 100).toFixed(2);
									return `${percentage}%`;
								},
							},
						},
					},
				}}
			/>
			{value > 0 && (
				<div className="absolute h-[255px] w-full">
					<p
						className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white`}
					>
						{value} {value === 1 ? "manutenção" : "manutenções"}
					</p>
				</div>
			)}
		</div>
	);
}

export default CustomChart;
