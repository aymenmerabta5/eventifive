

export default async function EventTypePage({ params }: { params: { eventType: string } }) {
    const { eventType } = await params;
    return (
        <div>
            <h1>{eventType}</h1>
        </div>
    )
}