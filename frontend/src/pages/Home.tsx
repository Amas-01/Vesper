export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-vesper-600 mb-4">Vesper</h1>
      <p className="text-2xl text-slate-600 mb-8">
        Real-Time Per-Block Payment Streaming on Stacks
      </p>
      <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
        Stream payments block by block. No middlemen, no delays. Pure on-chain streaming powered by Clarity smart contracts.
      </p>
      <div className="flex gap-4 justify-center">
        <button className="vesper-btn-primary px-8 py-3">
          Get Started
        </button>
        <button className="vesper-btn px-8 py-3 border-2 border-vesper-600 text-vesper-600">
          Learn More
        </button>
      </div>
    </div>
  )
}
