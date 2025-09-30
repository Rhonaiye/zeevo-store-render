"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { PieLabelRenderProps as PieLabelProps } from "recharts";
import { useAppStore } from "@/store/useAppStore";

type AnalyticsData = {
  store: { _id: string; name: string };
  totals: { sessions: number; uniqueVisitors: number; views: number };
  last7Days: {
    date: string;
    views: number;
    uniqueVisitors: number;
    sessions: number;
    purchases: number;
    devices: { desktop: number; mobile: number; tablet: number };
    trafficSources: Record<string, number>;
    regions: Record<string, number>;
    products: any[];
  }[];
  trafficSources: Record<string, number>;
  devices: { desktop: number; mobile: number; tablet: number };
  regions: Record<string, number>;
  topProducts: { product: string; views: number; purchases: number; revenue: number }[];
};

const COLORS = ["#00A86B", "#4CAF50", "#2E7D32", "#66BB6A", "#81C784", "#A5D6A7"];

// Loader Component
function Loader() {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-gray-200 border-t-[#00A86B]"></div>
    </div>
  );
}

// Custom legend renderer to show name and value
const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap justify-center gap-2 sm:gap-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center text-[10px] sm:text-[12px] text-gray-800">
          <span
            className="inline-block w-3 h-3 mr-1 sm:mr-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          ></span>
          {`${entry.value}: ${entry.payload.value}`}
        </li>
      ))}
    </ul>
  );
};

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl shadow bg-[#C4FEC8] p-2 sm:p-3">
      <h3 className="text-xs sm:text-sm text-gray-500 font-medium">{title}</h3>
      <p className="text-sm sm:text-base font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile } = useAppStore();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/analytics/get-analytics/${userProfile?.stores[0]?._id}`);
        if (!response.ok) {
          throw new Error();
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [userProfile?.stores]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-500">Not enough data provided</p>
      </div>
    );
  }

  const trafficData = data ? Object.entries(data.trafficSources).map(([key, value]) => ({ name: key, value })) : [];
  const deviceData = data ? Object.entries(data.devices).map(([key, value]) => ({ name: key, value })) : [];
  const regionData = data ? Object.entries(data.regions).map(([key, value]) => ({ name: key, value })) : [];
  const viewsData = data ? data.last7Days.map((day) => ({
    date: day.date,
    views: day.views,
    uniqueVisitors: day.uniqueVisitors,
  })) : [];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
        {data ? `${data.store.name} Analytics` : "Analytics Dashboard"}
      </h1>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Views" value={data ? data.totals.views : "Not enough data"} />
        <StatCard title="Unique Visitors" value={data ? data.totals.uniqueVisitors : "Not enough data"} />
        <StatCard title="Sessions" value={data ? data.totals.sessions : "Not enough data"} />
      </div>

      {/* Views Trend */}
      <div className="rounded-2xl shadow bg-transparent p-2 sm:p-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Views (Last 7 Days)</h2>
        <div className="w-full h-64 sm:h-72">
          {viewsData.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm text-center mt-20">Not enough data provided</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="gradientViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00A86B" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                  tick={{ fill: "#1f2937", fontSize: 10, fontWeight: "medium" }}
                  className="text-[10px] sm:text-[12px]"
                />
                <YAxis
                  tick={{ fill: "#1f2937", fontSize: 10, fontWeight: "medium" }}
                  domain={[0, "auto"]}
                  className="text-[10px] sm:text-[12px]"
                />
                <Tooltip
                  formatter={(value, name) => [value, name === "views" ? "Views" : "Unique Visitors"]}
                  labelFormatter={(d) => new Date(d).toDateString()}
                  contentStyle={{ backgroundColor: "#1f2937", color: "#fff", borderRadius: "8px", fontSize: 10 }}
                  cursor={false}
                />
                <Legend wrapperStyle={{ fontSize: "10px", color: "#1f2937", fontWeight: "medium" }} />
                <Bar
                  dataKey="views"
                  fill="url(#gradientViews)"
                  radius={[8, 8, 0, 0]}
                  barSize={20}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <Bar
                  dataKey="uniqueVisitors"
                  fill="#2E7D32"
                  radius={[8, 8, 0, 0]}
                  barSize={20}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Traffic, Devices, Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        <div className="rounded-2xl shadow bg-transparent p-2 sm:p-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Traffic Sources</h2>
          <div className="w-full h-56 sm:h-64">
            {trafficData.length === 0 || trafficData.every((d) => d.value === 0) ? (
              <p className="text-gray-500 text-xs sm:text-sm text-center mt-16">Not enough data provided</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={trafficData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    innerRadius={50}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    isAnimationActive={true}
                  >
                    {trafficData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", color: "#fff", borderRadius: "8px", fontSize: 10 }} />
                  <Legend content={renderLegend} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl shadow bg-transparent p-2 sm:p-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Devices</h2>
          <div className="w-full h-56 sm:h-64">
            {deviceData.length === 0 || deviceData.every((d) => d.value === 0) ? (
              <p className="text-gray-500 text-xs sm:text-sm text-center mt-16">Not enough data provided</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={deviceData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    innerRadius={50}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    isAnimationActive={true}
                  >
                    {deviceData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", color: "#fff", borderRadius: "8px", fontSize: 10 }} />
                  <Legend content={renderLegend} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl shadow bg-transparent p-2 sm:p-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Regions</h2>
          <div className="w-full h-56 sm:h-64">
            {regionData.length === 0 || regionData.every((d) => d.value === 0) ? (
              <p className="text-gray-500 text-xs sm:text-sm text-center mt-16">Not enough data provided</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={regionData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    innerRadius={50}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    isAnimationActive={true}
                  >
                    {regionData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", color: "#fff", borderRadius: "8px", fontSize: 10 }} />
                  <Legend content={renderLegend} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-2xl shadow bg-transparent p-2 sm:p-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Top Products</h2>
        {data && data.topProducts.length === 0 ? (
          <p className="text-gray-500 text-xs sm:text-sm">Not enough data provided</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-1 sm:p-2 text-gray-800 font-medium">Product</th>
                  <th className="p-1 sm:p-2 text-gray-800 font-medium">Views</th>
                  <th className="p-1 sm:p-2 text-gray-800 font-medium">Purchases</th>
                  <th className="p-1 sm:p-2 text-gray-800 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data?.topProducts.map((p, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-1 sm:p-2 text-gray-800">{p.product}</td>
                    <td className="p-1 sm:p-2 text-gray-800">{p.views}</td>
                    <td className="p-1 sm:p-2 text-gray-800">{p.purchases}</td>
                    <td className="p-1 sm:p-2 text-gray-800">₦{p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}