'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';

// Dynamically import Chart to avoid SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// --- Appointments Line Chart ---

const appointmentsLineChartOptions: ApexOptions = {
  chart: {
    type: 'line',
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    background: 'transparent',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  colors: ['#3A6DFF'],
  grid: {
    show: true,
    borderColor: 'rgba(160, 160, 160, 0.2)',
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: false
      }
    },
    padding: {
      left: 10,
      right: 10,
    }
  },
  xaxis: {
    categories: ['Vie', 'Sáb', 'Dom', 'Lun', 'Mar', 'Mié', 'Jue'],
    labels: {
      style: {
        colors: '#A0A0A0',
        fontSize: '12px',
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#A0A0A0',
        fontSize: '12px',
      },
      formatter: (value) => `${Math.round(value)}`,
    },
  },
  markers: {
    size: 5,
    colors: ['#3A6DFF'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: {
      size: 7,
    },
  },
  tooltip: {
    theme: 'dark',
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
        return `<div class="p-2 bg-gray-800 border-none rounded-md shadow-lg">
            <span class="font-bold text-white">${series[seriesIndex][dataPointIndex]} citas</span>
        </div>`
    }
  },
  legend: {
    show: false,
  },
};

const appointmentsLineChartSeries = [
  {
    name: 'Citas',
    data: [5, 3, 6, 4, 2, 3, 4],
  },
];

export function AppointmentsLineChart() {
  return (
    <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all bg-card/50">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Evolución de Citas</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart
          options={appointmentsLineChartOptions}
          series={appointmentsLineChartSeries}
          type="line"
          height={250}
          width="100%"
        />
      </CardContent>
    </Card>
  );
}

// --- Lab Results Bar Chart ---

const labResultsBarChartOptions: ApexOptions = {
    chart: {
        type: 'bar',
        height: 250,
        toolbar: { show: false },
        background: 'transparent',
    },
    plotOptions: {
        bar: {
            horizontal: true,
            borderRadius: 6,
            barHeight: '50%',
            dataLabels: {
                position: 'top',
            },
        },
    },
    colors: ['#28A745', '#DC3545'],
    dataLabels: {
        enabled: true,
        offsetX: -10,
        style: {
            fontSize: '14px',
            fontWeight: 'bold',
            colors: ['#fff']
        },
        dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.5
        }
    },
    stroke: {
        show: false,
    },
    xaxis: {
        categories: ['Completados', 'Pendientes'],
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: {
        labels: {
            show: true,
            style: {
                colors: '#A0A0A0',
                fontSize: '14px',
                fontWeight: 500,
            }
        },
    },
    grid: {
        show: false,
    },
    tooltip: {
        theme: 'dark',
        shared: true,
        intersect: false,
        y: {
            formatter: (val) => val.toString(),
            title: {
                formatter: (seriesName) => `${seriesName}:`
            }
        }
    },
    legend: {
        show: false,
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark',
            type: "horizontal",
            shadeIntensity: 0.5,
            gradientToColors: undefined, // let apex decide
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 100],
            colorStops: []
        }
    }
};

const labResultsBarChartSeries = [{
    data: [12, 4]
}];

export function LabResultsBarChart() {
    return (
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all bg-card/50">
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Resultados de Laboratorio</CardTitle>
            </CardHeader>
            <CardContent>
                <Chart
                    options={labResultsBarChartOptions}
                    series={labResultsBarChartSeries}
                    type="bar"
                    height={250}
                    width="100%"
                />
            </CardContent>
        </Card>
    );
}

const psaChartOptions: ApexOptions = {
    chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        background: 'transparent',
    },
    stroke: {
        curve: 'smooth',
        width: 2,
    },
    colors: ['#FFC107'],
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.3,
            stops: [0, 90, 100]
        }
    },
    dataLabels: {
        enabled: false
    },
    grid: {
        borderColor: 'rgba(160, 160, 160, 0.1)',
        strokeDashArray: 3,
    },
    xaxis: {
        type: 'datetime',
        categories: [
            "2023-02-01", "2023-05-01", "2023-08-01", 
            "2023-11-01", "2024-02-01", "2024-05-01"
        ],
        labels: {
            style: {
                colors: '#A0A0A0',
                fontSize: '12px',
            },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: {
        title: {
            text: 'PSA (ng/mL)',
            style: {
                color: '#A0A0A0',
                fontWeight: 500,
            }
        },
        labels: {
            style: {
                colors: '#A0A0A0',
                fontSize: '12px',
            },
        },
    },
    tooltip: {
        theme: 'dark',
        x: {
            format: 'dd MMM yyyy'
        }
    },
    markers: {
        size: 4,
        colors: ['#FFC107'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
            size: 6,
        },
    }
};

const psaChartSeries = [{
    name: 'PSA Level',
    data: [2.5, 2.8, 3.0, 3.2, 3.5, 4.1]
}];


export function PsaChart() {
    return (
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all bg-card/50">
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">PSA Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
                <Chart
                    options={psaChartOptions}
                    series={psaChartSeries}
                    type="area"
                    height={300}
                    width="100%"
                />
            </CardContent>
        </Card>
    )
}
