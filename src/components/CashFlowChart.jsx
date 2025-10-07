import React from 'react';
import ReactECharts from 'echarts-for-react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';
import * as echarts from 'echarts';

const fullConfig = resolveConfig(tailwindConfig);

const CashFlowChart = ({ data }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['Ingresos', 'Gastos'],
      textStyle: {
        color: fullConfig.theme.colors.slate[600]
      },
      top: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: data.dates,
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
        name: 'Ingresos',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 2,
        lineStyle: {
          width: 3,
          color: fullConfig.theme.colors.primary[600]
        },
        itemStyle: {
            color: fullConfig.theme.colors.primary[600],
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(124, 58, 237, 0.4)'
            },
            {
              offset: 1,
              color: 'rgba(124, 58, 237, 0)'
            }
          ])
        },
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 4,
          },
          itemStyle: {
            symbolSize: 8,
            borderColor: 'rgba(124, 58, 237, 0.3)',
            borderWidth: 8,
          }
        },
        data: data.incomes
      },
      {
        name: 'Gastos',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 2,
        lineStyle: {
          width: 3,
          color: fullConfig.theme.colors.red[400]
        },
        itemStyle: {
            color: fullConfig.theme.colors.red[400]
        },
        areaStyle: {
          opacity: 0.5,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(248, 113, 113, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(248, 113, 113, 0)'
            }
          ])
        },
        emphasis: {
          focus: 'series',
           lineStyle: {
            width: 4,
          },
          itemStyle: {
            symbolSize: 8,
            borderColor: 'rgba(248, 113, 113, 0.3)',
            borderWidth: 8,
          }
        },
        data: data.expenses
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '350px' }} notMerge={true} />;
};

export default CashFlowChart;
