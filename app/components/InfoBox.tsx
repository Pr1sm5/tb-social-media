interface InfoBoxProps {
    text: string;
}

export default function InfoBox({ text }: InfoBoxProps) {
    return (
        <aside className="info-box">
            <h3>Info</h3>
            <p>{text}</p>
        </aside>
    );
}