import Header from "../components/Header";
import StatusCard from "../components/StatusCard";
import ChannelsList from "../components/ChannelsList";
import RmsChart from "../components/RmsChart";

export default function Dashboard() {
  return (
    <div style={{ padding: "2rem" }}>
      <Header />
      <StatusCard />
      <ChannelsList />
      <RmsChart />
    </div>
  );
}
