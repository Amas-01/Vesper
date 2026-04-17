import CreateStreamForm from '../components/stream/CreateStreamForm'

export default function CreateStream() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-8">Create Payment Stream</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CreateStreamForm />
        </div>
        <div className="vesper-card p-6 h-fit sticky top-32">
          <h3 className="text-lg font-bold text-dark-text mb-6">Preview</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-dark-text-secondary mb-1">Stream Rate</p>
              <p className="text-dark-text font-semibold">-- STX/block</p>
            </div>
            <div className="vesper-divider"></div>
            <div>
              <p className="text-dark-text-secondary mb-1">Total Duration</p>
              <p className="text-dark-text font-semibold">-- days</p>
            </div>
            <div className="vesper-divider"></div>
            <div>
              <p className="text-dark-text-secondary mb-1">Protocol Fee (0.25%)</p>
              <p className="text-dark-text font-semibold">-- STX</p>
            </div>
            <div className="vesper-divider"></div>
            <div>
              <p className="text-dark-text-secondary mb-1">Net Deposit</p>
              <p className="text-vesper-300 font-bold text-lg">-- STX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
