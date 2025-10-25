import { useEffect, useState } from "react";
import api from "../api/client";

export default function StatusCard() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    api.get("/status").then((res) => setStatus(res.data));
  }, []);

  if (!status) return <p>Loading...</p>;

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
      <h3>System Status</h3>
      <p>Running: {status.running ? "✅" : "❌"}</p>
      <p>Data Path: {status.data_path}</p>
    </div>
  );
}
