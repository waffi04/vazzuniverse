"use client";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FormatPrice } from "@/utils/formatPrice";

export function TransactionStatusChart({
  data,
}: {
  data: {
    statusCounts: {
      successful?: number;
      pending?: number;
      failed?: number;
    };
  };
}) {
  // Transformasi data ke format yang dibutuhkan chart
  const transformStatusData = (statusCounts: {
    successful?: number;
    pending?: number;
    failed?: number;
  }) => {
    const totalTransactions = Object.values(statusCounts).reduce(
      (a, b) => (a || 0) + (b || 0),
      0
    );

    return Object.entries(statusCounts)
      .filter(([_, count]) => count && count > 0)
      .map(([status, count]) => ({
        status: status.toLowerCase(), // Pastikan nama status lowercase
        count: count || 0,
        amount: count,
        percentage:
          totalTransactions > 0
            ? ((count || 0) / totalTransactions * 100).toFixed(1)
            : "0",
      }));
  };

  // Transform data
  const chartData = transformStatusData(data.statusCounts);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        No data available
      </div>
    );
  }

  const statusColors = {
    pending: "#FFB703", // Kuning cerah
    successful: "#83C5BE", // Biru muda
    failed: "#E63946", // Merah terang
  };

  const statusLabels = {
    pending: "Pending",
    successful: "Successful",
    failed: "Failed",
  };

  // Format data untuk chart
  const formattedData = chartData.map((item) => ({
    name: statusLabels[item.status as keyof typeof statusLabels] || item.status,
    value: item.count,
    amount: item.amount,
    percentage: item.percentage,
  }));


  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percentage }) =>
              `${name}: ${percentage}%`
            }
            labelLine={true}
          >
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  statusColors[entry.name.toLowerCase() as keyof typeof statusColors] ||
                  "#999999"
                }
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => {
              if (name === "value") {
                return [`${value} transactions`, "Count"];
              }
              return [FormatPrice(props.payload.amount), "Amount"];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}