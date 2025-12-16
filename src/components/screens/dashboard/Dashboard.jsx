import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { AnalyticsService } from "../../../services/AnalyticsService";
import { SocketService } from "../../../services/SocketService";
import { buildAnalyticsPayload } from "../../../util/apiHelpers";

const Dashboard = () => {
  const [liveOccupancy, setLiveOccupancy] = useState(0);
  const [footfall, setFootfall] = useState(0);
  const [dwellTime, setDwellTime] = useState("00:00");
  const [occupancyComparison, setOccupancyComparison] = useState(0);
  const [footfallComparison, setFootfallComparison] = useState(0);
  const [dwellTimeComparison, setDwellTimeComparison] = useState(0);
  const [occupancyChartData, setOccupancyChartData] = useState([]);
  const [demographicsPieData, setDemographicsPieData] = useState([]);
  const [demographicsTimelineData, setDemographicsTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("Today");

  const COLORS = ["#009688", "#4db6ac", "#80cbc4", "#b2dfdb"];

  useEffect(() => {
    fetchDashboardData();

    const unsubscribe = SocketService.subscribeToLiveOccupancy((data) => {
      if (data && data.occupancy !== undefined) {
        setLiveOccupancy(data.occupancy);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const selectedDateObj =
        selectedDate === "Today" ? new Date() : new Date(selectedDate);
      const requestData = buildAnalyticsPayload({
        date: selectedDateObj,
      });

      const dwellResponse = await AnalyticsService.getDwellTime(requestData);
      const dwellData = dwellResponse?.data || dwellResponse;
      if (dwellData) {
        const minutes = Math.floor(dwellData.avgDwellMinutes || 0);
        const seconds = Math.floor((dwellData.avgDwellMinutes % 1) * 60);
        setDwellTime(
          `${String(minutes).padStart(2, "0")}min ${String(seconds).padStart(
            2,
            "0"
          )}sec`
        );
        setDwellTimeComparison(6);
      }

      const footfallResponse = await AnalyticsService.getFootfall(requestData);
      const footfallData = footfallResponse?.data || footfallResponse;
      if (footfallData) {
        setFootfall(footfallData.footfall || 0);
        setFootfallComparison(-10);
      }

      try {
        const occupancyResponse = await AnalyticsService.getOccupancy(
          requestData
        );
        const occupancyData = occupancyResponse?.data || occupancyResponse;
        console.log("Occupancy response--------->", occupancyData);

        if (occupancyData) {
          if (Array.isArray(occupancyData)) {
            const chartData = occupancyData.map((bucket) => ({
              time: new Date(
                bucket.hourUtc || bucket.timestamp || bucket.time
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              occupancy: bucket.count || bucket.occupancy || bucket.value || 0,
            }));
            setOccupancyChartData(chartData);
            setLiveOccupancy(chartData[chartData.length - 1]?.occupancy || 0);
          } else {
            setLiveOccupancy(occupancyData.currentOccupancy || 734);
            setOccupancyChartData(
              occupancyData.timeseries || generateMockOccupancyData()
            );
          }
          setOccupancyComparison(10);
        }
      } catch (occupancyErr) {
        if (occupancyErr.response?.status === 404) {
          console.warn("Occupancy endpoint returned 404 - using mock data");
          setOccupancyChartData(generateMockOccupancyData());
          setLiveOccupancy(734);
          setOccupancyComparison(10);
        }
      }

      const demographicsResponse = await AnalyticsService.getDemographics(
        requestData
      );
      const demographicsData =
        demographicsResponse?.data || demographicsResponse;
      console.log("Demographics response ------------>", demographicsData);
      if (demographicsData) {
        if (Array.isArray(demographicsData)) {
          const timelineData = demographicsData.map((bucket) => ({
            time: new Date(
              bucket.hourUtc || bucket.timestamp
            ).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            male: bucket.male || 0,
            female: bucket.female || 0,
          }));
          setDemographicsTimelineData(timelineData);

          const totalMale = timelineData.reduce(
            (sum, item) => sum + (item.male || 0),
            0
          );
          const totalFemale = timelineData.reduce(
            (sum, item) => sum + (item.female || 0),
            0
          );
          const total = totalMale + totalFemale;

          // Calculate percentages for pie chart
          const malePercent = total > 0 ? (totalMale / total) * 100 : 0;
          const femalePercent = total > 0 ? (totalFemale / total) * 100 : 0;

          setDemographicsPieData([
            { name: "Male", value: totalMale, percent: malePercent },
            { name: "Female", value: totalFemale, percent: femalePercent },
          ]);
        } else {
          setDemographicsPieData(
            demographicsData.pieChart || generateMockPieData()
          );
          setDemographicsTimelineData(
            demographicsData.timeseries || generateMockDemographicsData()
          );
        }
      }
    } catch (err) {

      // Log 400 errors with details
      if (err.response?.status === 400) {
        console.error(
          "400 Bad Request - API expects different payload structure"
        );
        console.error("Request payload was:", {
          date:
            selectedDate === "Today"
              ? new Date().toISOString().split("T")[0]
              : selectedDate,
        });
        console.error("API error details:", err.response?.data);
      }

      // setting mock data onlyfor development
      setLiveOccupancy(734);
      setFootfall(2436);
      setDwellTime("08:30");
      setOccupancyComparison(10);
      setFootfallComparison(-10);
      setDwellTimeComparison(6);
      setOccupancyChartData(generateMockOccupancyData());
      setDemographicsPieData(generateMockPieData());
      setDemographicsTimelineData(generateMockDemographicsData());
      // setError('Failed to load dashboard data')
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators for development
  const generateMockOccupancyData = () => {
    const times = [
      "8:00",
      "9:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ];
    return times.map((time) => ({
      time,
      occupancy: Math.floor(Math.random() * 100) + 100,
    }));
  };

  const generateMockPieData = () => {
    return [
      { name: "Male", value: 55 },
      { name: "Female", value: 45 },
    ];
  };

  const generateMockDemographicsData = () => {
    const times = [
      "8:00",
      "9:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ];
    return times.map((time) => ({
      time,
      male: Math.floor(Math.random() * 50) + 200,
      female: Math.floor(Math.random() * 50) + 180,
    }));
  };

  const formatDwellTime = (time) => {
    if (typeof time === "string") return time;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}min ${String(seconds).padStart(
      2,
      "0"
    )}sec`;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="text-center py-10 text-lg text-gray-600">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 m-0">Overview</h1>
        <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-800 cursor-pointer transition-all font-medium hover:bg-gray-100 hover:border-teal-500">
          {selectedDate}
        </button>
      </div>

      {error && (
        <div className="text-center py-10 text-lg text-red-600 bg-red-50 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
          <div className="text-sm text-gray-600 mb-3 font-medium">
            Live Occupancy
          </div>
          <div className="text-4xl font-bold text-gray-800 mb-3 leading-tight">
            {liveOccupancy.toLocaleString()}
          </div>
          <div
            className={`text-[13px] font-medium flex items-center gap-1 ${
              occupancyComparison >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {occupancyComparison >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(occupancyComparison)}% More than yesterday
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
          <div className="text-sm text-gray-600 mb-3 font-medium">
            Today's Footfall
          </div>
          <div className="text-4xl font-bold text-gray-800 mb-3 leading-tight">
            {footfall.toLocaleString()}
          </div>
          <div
            className={`text-[13px] font-medium flex items-center gap-1 ${
              footfallComparison >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {footfallComparison >= 0 ? "↑" : "↓"} {Math.abs(footfallComparison)}
            % {footfallComparison >= 0 ? "More" : "Less"} than yesterday
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
          <div className="text-sm text-gray-600 mb-3 font-medium">
            Avg Dwell Time
          </div>
          <div className="text-4xl font-bold text-gray-800 mb-3 leading-tight">
            {formatDwellTime(dwellTime)}
          </div>
          <div
            className={`text-[13px] font-medium flex items-center gap-1 ${
              dwellTimeComparison >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {dwellTimeComparison >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(dwellTimeComparison)}% More than yesterday
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] w-full">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">
              Overall Occupancy
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#009490]"></div>
              <span className="text-sm text-gray-600">Occupancy</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={occupancyChartData}>
              <defs>
                <linearGradient
                  id="occupancyGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#009490" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#009490" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="time"
                stroke="#666"
                tick={{ fill: "#666", fontSize: 12 }}
                label={{
                  value: "Time",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                label={{ value: "Count", angle: -90, position: "insideLeft" }}
                stroke="#666"
                tick={{ fill: "#666", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <Area
                type="monotone"
                dataKey="occupancy"
                stroke="#009490"
                fill="url(#occupancyGradient)"
                strokeWidth={2}
                name="Occupancy"
              />
              {/* Vertical red dotted line at the last data point */}
              <ReferenceLine
                x={occupancyChartData[occupancyChartData.length - 1]?.time}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: "Live",
                  position: "insideTopRight",
                  fill: "#ef4444",
                  fontSize: 12,
                  fontWeight: "600",
                  angle: -90,
                  offset: 15,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="text-3xl font-bold text-gray-800 m-0">Demographics</div>
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-6">
          <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Chart of Demographics
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demographicsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  labelLine={false}
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {demographicsPieData.map((entry, index) => {
                    const colors = ["#5f9ea0", "#b0d4d4"];
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    );
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="text-center -mt-[170px] relative z-10 pointer-events-none">
              <div className="text-sm text-gray-600">Total Crowd</div>
              <div className="text-2xl font-semibold text-gray-800">
                {demographicsPieData.reduce(
                  (sum, item) => sum + item.value,
                  0
                ) + "%"}
              </div>
            </div>

            <div className="gap-6 mt-4">
              {demographicsPieData.map((entry, index) => {
                const totalCrowd = demographicsPieData.reduce(
                  (sum, item) => sum + item.value,
                  0
                );
                const percent =
                  totalCrowd > 0
                    ? ((entry.value / totalCrowd) * 100).toFixed(0)
                    : 0;
                const colors = ["#5f9ea0", "#b0d4d4"];

                return (
                  <div key={index} className="flex gap-2 text-sm pt-8">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={colors[index]}
                      className="flex-shrink-0"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span className="text-gray-800 font-medium">
                      {percent}% {entry.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Demographics Analysis
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#5f9ea0]"></div>
                  <span className="text-sm text-gray-600">Male</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#b0d4d4]"></div>
                  <span className="text-sm text-gray-600">Female</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={demographicsTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="time"
                  stroke="#666"
                  tick={{ fill: "#666", fontSize: 12 }}
                  label={{
                    value: "Time",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{ value: "Count", angle: -90, position: "insideLeft" }}
                  stroke="#666"
                  tick={{ fill: "#666", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="male"
                  stackId="1"
                  stroke="#5f9ea0"
                  fill="#5f9ea0"
                  fillOpacity={0.6}
                  strokeWidth={2}
                  name="Male"
                />
                <Area
                  type="monotone"
                  dataKey="female"
                  stackId="1"
                  stroke="#b0d4d4"
                  fill="#b0d4d4"
                  fillOpacity={0.6}
                  strokeWidth={2}
                  name="Female"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
