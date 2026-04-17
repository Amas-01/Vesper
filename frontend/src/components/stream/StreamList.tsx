export default function StreamList({ streams }: { streams: any[] }) {
  if (streams.length === 0) {
    return (
      <div className="vesper-card p-12 text-center">
        <p className="text-dark-text text-lg font-medium">No streams yet</p>
        <p className="text-dark-text-secondary text-sm mt-2">Create your first stream to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {streams.map((stream) => (
        <div key={stream.id} className="vesper-card p-4">
          {/* Stream item rendered here*/}
        </div>
      ))}
    </div>
  )
}
