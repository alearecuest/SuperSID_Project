import { useEffect, useState } from "react";
import api from "../api/client";

export default function ChannelsList() {
  const [channels, setChannels] = useState<string[]>([]);

  useEffect(() => {
    api.get("/channels").then((res) => setChannels(res.data.channels));
  }, []);

  return (
    <div>
      <h3>Available Channels</h3>
      <ul>
        {channels.map((ch) => (
          <li key={ch}>{ch}</li>
        ))}
      </ul>
    </div>
  );
}
