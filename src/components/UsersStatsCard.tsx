import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const UsersStatsCard = () => {
  const [brandColor, setBrandColor] = useState("#6366f1");

  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    const color =
      computedStyle.getPropertyValue("--color-fg-brand").trim() || "#6366f1";
    setBrandColor(color);
  }, []);

  const options = {
    chart: {
      height: 160,
      type: "area"as const,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    tooltip: { enabled: true },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: brandColor,
        gradientToColors: [brandColor],
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 4 },
    grid: { show: false },
    xaxis: {
      categories: [
        "01 Feb",
        "02 Feb",
        "03 Feb",
        "04 Feb",
        "05 Feb",
        "06 Feb",
        "07 Feb",
      ],
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
  };

  const series = [
    {
      name: "New users",
      data: [6500, 6418, 6456, 6526, 6356, 6456],
      color: brandColor,
    },
  ];

  return (
    <div className="max-w-sm w-full bg-white border border-slate-200  rounded-xl shadow p-4 md:p-6">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h5 className="text-2xl font-semibold text-slate-900 ">
            32.4k
          </h5>
          <p className="text-slate-500 text-sm">Users this week</p>
        </div>

        <div className="flex items-center text-green-600 text-sm font-medium">
          ↑ 12%
        </div>
      </div>

      {/* Chart */}
      <div className="my-4">
        <Chart options={options} series={series} type="area" height={160} />
      </div>

      {/* Footer */}
      <div className="border-t pt-4 flex justify-between items-center">

        <select className="text-sm bg-transparent outline-none text-slate-600">
          <option>Last 7 days</option>
          <option>Today</option>
          <option>Yesterday</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>

        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          Users Report →
        </button>
      </div>
    </div>
  );
};

export default UsersStatsCard;