import React from 'react';
import ReactECharts from 'echarts-for-react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

const MemberExpenseComparisonChart = ({ data }) => {
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
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLine: {
        lineStyle: { color: fullConfig.theme.colors.slate[300] }
      },
      axisLabel: {
        color: fullConfig.theme.colors.slate[500]
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: 'S/ {value}',
        color: fullConfig.theme.colors.slate[500]
      },
      splitLine: {
        lineStyle: { color: fullConfig.theme.colors.slate[200] }
      }
    },
    series: [
      {
        name: 'Gastos Totales',
        type: 'bar',
        barWidth: '40%',
        data: data.map(d => d.value),
        itemStyle: {
          color: fullConfig.theme.colors.primary[500],
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-slate-500">No hay datos de gastos para comparar.</div>;
  }

  return <ReactECharts option={option} style={{ height: '300px' }} notMerge={true} />;
};

export default MemberExpenseComparisonChart;
