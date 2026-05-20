//Feld wo eingegebener Text angezeigt wird
export default function TextOutputComponent({ text }: { text: string }) {
  return (
    <div style={post}>
      {text}
    </div>
  );
}

const post = {
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  marginBottom: "10px",
  background: "#fff",
};