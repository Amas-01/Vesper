export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-8">Dashboard</h1>
      {/* Summary cards section */}
      <div className="responsive-grid mb-12">
        <div className="vesper-card p-6 text-center">
          <p className="text-dark-text-secondary text-sm mb-2">Active Streams Sent</p>
          <p className="text-3xl font-bold text-vesper-300">0</p>
        </div>
        <div className="vesper-card p-6 text-center">
          <p className="text-dark-text-secondary text-sm mb-2">Active Streams Receiving</p>
          <p className="text-3xl font-bold text-vesper-300">0</p>
        </div>
        <div className="vesper-card p-6 text-center">
          <p className="text-dark-text-secondary text-sm mb-2">Total STX Streaming Out</p>
          <p className="text-3xl font-bold text-blue-300">0.00 STX</p>
        </div>
        <div className="vesper-card p-6 text-center">
          <p className="text-dark-text-secondary text-sm mb-2">Total STX Claimable</p>
          <p className="text-3xl font-bold text-green-300">0.00 STX</p>
        </div>
      </div>

      {/* Tabs and stream lists go here */}
      <div className="vesper-card p-8">
        <p className="text-dark-text-secondary text-center">Connect your wallet to view streams</p>
      </div>
    </div>
  )
}
