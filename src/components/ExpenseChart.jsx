import React from 'react';
import ReactECharts from 'echarts-for-react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

const ExpenseChart = ({ data, height = '300px' }) => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: S/ {c} ({d}%)'
    },
    legend: {
      show: height !== '150px', // Hide legend on smaller charts
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        color: fullConfig.theme.colors.slate[600]
      }
    },
    color: [
      fullConfig.theme.colors.primary[500],
      fullConfig.theme.colors.sky[400],
      fullConfig.theme.colors.emerald[400],
      fullConfig.theme.colors.amber[400],
      fullConfig.theme.colors.rose[400],
      fullConfig.theme.colors.violet[400],
    ],
    series: [
      {
        name: 'Gastos por Categoría',
        type: 'pie',
        radius: ['50%', '70%'],
        center: height === '150px' ? ['50%', '50%'] : ['75%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: height }} notMerge={true} />;
};

export default ExpenseChart;
