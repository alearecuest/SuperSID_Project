import { useState } from "react";
import ChannelsList from "./components/ChannelsList";
import Spectrogram from "./components/Spectrogram";
import "./App.css";

function App() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <img
          src="/SuperSID.png"
          alt="SuperSID Logo"
          className="app-logo"
        />
        <h1>SuperSID App</h1>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <ChannelsList onSelect={setSelectedChannel} />
        </aside>
        <section className="content">
          {selectedChannel ? (
            <Spectrogram channel={selectedChannel} />
          ) : (
            <p>Please select a channel</p>
          )}
        </section>
      </main>

      <footer className="app-footer">
        © 2025 Alejandro Arévalo — SuperSID App
      </footer>
    </div>
  );
}

export default App;
