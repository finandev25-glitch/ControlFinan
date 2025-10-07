import React from 'react';
import ReactECharts from 'echarts-for-react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

const ExpenseTimelineChart = ({ data, onEvents }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: S/ {c}'
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
        data: data.labels,
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          lineStyle: {
            color: fullConfig.theme.colors.slate[300]
          }
        },
        axisLabel: {
          color: fullConfig.theme.colors.slate[500]
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          formatter: 'S/ {value}',
          color: fullConfig.theme.colors.slate[500]
        },
        splitLine: {
          lineStyle: {
            color: fullConfig.theme.colors.slate[200]
          }
        }
      }
    ],
    series: [
      {
        name: 'Gastos',
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: fullConfig.theme.colors.primary[500],
          borderRadius: [4, 4, 0, 0]
        },
        data: data.amounts
      }
    ]
  };

  if (!data || data.amounts.length === 0) {
    return <div className="flex items-center justify-center h-[350px] text-slate-500">Selecciona una categoría para ver su línea de tiempo.</div>;
  }

  return <ReactECharts option={option} style={{ height: '350px' }} notMerge={true} onEvents={onEvents} />;
};

export default ExpenseTimelineChart;
