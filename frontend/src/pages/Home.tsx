import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center py-20 max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold text-gradient mb-6">Vesper</h1>
        <p className="text-3xl text-dark-text font-light mb-8">
          Real-Time Per-Block Payment Streaming on Stacks
        </p>
        <p className="text-lg text-dark-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
          Stream payments block by block. No middlemen, no delays. Pure on-chain streaming powered by Clarity smart contracts.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/create" className="vesper-btn-primary px-8 py-3 text-lg">
            Get Started
          </Link>
          <a
            href="https://github.com/Amas-01/Vesper"
            target="_blank"
            rel="noopener noreferrer"
            className="vesper-btn-secondary px-8 py-3 text-lg"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
