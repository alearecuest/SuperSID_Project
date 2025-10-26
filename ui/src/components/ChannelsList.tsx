import { useEffect, useState } from "react";
import api from "../api/client";

interface Props {
  onSelect: (channel: string) => void;
}

export default function ChannelsList({ onSelect }: Props) {
  const [channels, setChannels] = useState<string[]>([]);

  useEffect(() => {
    api.get("/channels").then((res) => setChannels(res.data.channels));
  }, []);

  return (
    <div>
      <h3>Available Channels</h3>
      <ul>
        {channels.map((ch) => (
          <li
            key={ch}
            style={{ cursor: "pointer", margin: "0.5rem 0" }}
            onClick={() => onSelect(ch)}
          >
            {ch}
          </li>
        ))}
      </ul>
    </div>
  );
}
