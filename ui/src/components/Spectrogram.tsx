import { useEffect, useState } from "react";
import api from "../api/client";
import { Heatmap } from "@ant-design/plots";

interface FFTData {
  freqs: number[];
  spectrum: number[];
}

export default function Spectrogram() {
  const [history, setHistory] = useState<{ freq: number; time: number; power: number }[]>([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      api.get<FFTData>("/fft", { params: { channel: "DHO38" } }).then((res) => {
        const { freqs, spectrum } = res.data;
        const newPoints = freqs.map((f, i) => ({
          freq: f,
          time,
          power: spectrum[i],
        }));
        setHistory((prev) => [...prev.slice(-5000), ...newPoints]);
        setTime((t) => t + 1);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [time]);

  const config = {
    data: history,
    xField: "time",
    yField: "freq",
    colorField: "power",
    color: ["#000000", "#ff0000", "#ffff00"],
  };

  return (
    <div>
      <h3>Spectrogram (DHO38)</h3>
      <Heatmap {...config} />
    </div>
  );
}
