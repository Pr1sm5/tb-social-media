interface InfoBoxProps {
    text: string;
    type?: "info" | "error" | "success" | "warning";
}

export default function InfoBox({ text, type = "info" }: InfoBoxProps) {
    return (
        <aside className={`info-box ${type}`}>
            <h3>Info</h3>
            <p>{text}</p>
        </aside>
    );
}