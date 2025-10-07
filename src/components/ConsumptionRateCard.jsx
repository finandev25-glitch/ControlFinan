import React from 'react';
import ReactECharts from 'echarts-for-react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';
import { useMediaQuery } from '../hooks/useMediaQuery';

const fullConfig = resolveConfig(tailwindConfig);

const ConsumptionRateCard = ({ rate }) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 15,
            color: [
              [0.5, fullConfig.theme.colors.green[500]],
              [0.85, fullConfig.theme.colors.amber[500]],
              [1, fullConfig.theme.colors.red[500]],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '60%',
          width: 8,
          offsetCenter: [0, '-50%'],
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: 'auto',
          fontSize: isMobile ? 24 : 30,
          fontWeight: 'bold',
          offsetCenter: [0, '5%'],
        },
        data: [
          {
            value: Math.round(rate),
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col justify-between">
       <h3 className="text-sm font-medium text-slate-500 text-center">Tasa de Consumo</h3>
      <ReactECharts option={option} style={{ height: '150px' }} notMerge={true} />
    </div>
  );
};

export default ConsumptionRateCard;
