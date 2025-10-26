import { useEffect, useState } from "react";
import api from "../api/client";
import { Heatmap } from "@ant-design/plots";

interface FFTData {
  freqs: number[];
  spectrum: number[];
}

interface Props {
  channel: string;
}

export default function Spectrogram({ channel }: Props) {
  const [history, setHistory] = useState<
    { freq: number; time: number; power: number }[]
  >([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      api
        .get<FFTData>("/fft", { params: { channel } })
        .then((res) => {
          const { freqs, spectrum } = res.data;
          const newPoints = freqs.map((f, i) => ({
            freq: f,
            time,
            power: spectrum[i],
          }));
          setHistory((prev) => [...prev.slice(-5000), ...newPoints]);
          setTime((t) => t + 1);
        })
        .catch((err) => {
          console.error("Error fetching FFT:", err);
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [channel, time]);

  const config = {
    data: history,
    xField: "time",
    yField: "freq",
    colorField: "power",
    color: ["#000000", "#ff0000", "#ffff00"],
  };

  return (
    <div>
      <h3>Spectrogram ({channel})</h3>
      <Heatmap {...config} />
    </div>
  );
}
