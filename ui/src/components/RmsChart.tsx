import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import api from "../api/client";

interface DataPoint {
  ts: string;
  rms: number;
}

export default function RmsChart() {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      api.get("/features", { params: { channel: "DHO38" } })
        .then((res) => {
          setData((prev) => [...prev.slice(-50), ...res.data.items]);
        });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3>RMS (DHO38)</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="ts" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="rms" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}
