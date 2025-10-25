export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        padding: "1rem",
      }}
    >
      {/* Title centered */}
      <h1 style={{ textAlign: "center", margin: 0 }}>SuperSID App</h1>

      {/* Logo top-right */}
      <img
        src="/SuperSID.png"
        alt="SuperSID Logo"
        style={{
          position: "absolute",
          right: "1rem",
          top: "0.5rem",
          width: "100px",
        }}
      />
    </header>
  );
}
