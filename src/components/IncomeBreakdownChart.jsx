import React from 'react';
import ReactECharts from 'echarts-for-react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';
import { useMediaQuery } from '../hooks/useMediaQuery';

const fullConfig = resolveConfig(tailwindConfig);

const IncomeBreakdownChart = ({ data }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: S/ {c} ({d}%)'
    },
    legend: {
      orient: isMobile ? 'horizontal' : 'vertical',
      left: isMobile ? 'center' : 'left',
      top: isMobile ? 'bottom' : 'center',
      textStyle: {
        color: fullConfig.theme.colors.slate[600]
      }
    },
    color: [
      fullConfig.theme.colors.green[500],
      fullConfig.theme.colors.teal[400],
      fullConfig.theme.colors.cyan[400],
      fullConfig.theme.colors.sky[500],
      fullConfig.theme.colors.lime[500],
    ],
    series: [
      {
        name: 'Ingresos por Categoría',
        type: 'pie',
        radius: ['50%', '70%'],
        center: isMobile ? ['50%', '45%'] : ['75%', '50%'],
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

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-slate-500">No hay datos de ingresos para mostrar.</div>;
  }

  return <ReactECharts option={option} style={{ height: '300px' }} notMerge={true} />;
};

export default IncomeBreakdownChart;
