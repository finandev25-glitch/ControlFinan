import React from 'react';
import ReactECharts from 'echarts-for-react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

const IncomeExpenseChart = ({ data }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Ingresos', 'Gastos'],
      textStyle: {
        color: fullConfig.theme.colors.slate[600]
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data.dates,
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          formatter: '{value} €'
        }
      }
    ],
    color: [
      fullConfig.theme.colors.green[500],
      fullConfig.theme.colors.red[500]
    ],
    series: [
      {
        name: 'Ingresos',
        type: 'bar',
        barWidth: '40%',
        data: data.incomes
      },
      {
        name: 'Gastos',
        type: 'bar',
        barWidth: '40%',
        data: data.expenses
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '350px' }} />;
};

export default IncomeExpenseChart;
