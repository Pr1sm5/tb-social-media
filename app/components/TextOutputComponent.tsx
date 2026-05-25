type TextOutputProps = {
  text: string;
  name: string;        // z.B. "Max Mustermann"
  username: string;    // z.B. "username123"
  onDelete: () => void;
};

export default function TextOutputComponent({
  text,
  name,
  username,
  onDelete,
}: TextOutputProps) {
  return (
    <div style={containerStyle}>
      <div style={topRowStyle}>
        <div style={avatarStyle}>👤</div>

        <div style={userBlockStyle}>
          <div style={nameStyle}>{name}</div>
          <div style={handleStyle}>@{username}</div>
        </div>
      </div>

      <p style={textStyle}>{text}</p>

      <button onClick={onDelete} style={buttonStyle}>
        Delete
      </button>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  padding: "18px 20px",
  borderBottom: "1px solid #2f2f2f",
  color: "white",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const avatarStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#333",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  flexShrink: 0,
};

const userBlockStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const nameStyle: React.CSSProperties = {
  color: "white",
  fontWeight: 600,
};

const handleStyle: React.CSSProperties = {
  color: "#888",
  fontSize: "13px",
};

const textStyle: React.CSSProperties = {
  margin: 0,
};

const buttonStyle: React.CSSProperties = {
  width: "fit-content",
  padding: "6px 12px",
  border: "1px solid #444",
  borderRadius: "999px",
  background: "transparent",
  color: "#999",
  cursor: "pointer",
};