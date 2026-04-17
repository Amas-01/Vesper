export default function Footer() {
  return (
    <footer className="bg-dark-surface/50 border-t border-dark-border py-12 mt-auto">
      <div className="container-dark text-center">
        <p className="text-dark-text-secondary font-medium">© 2026 Vesper Protocol. All rights reserved.</p>
        <p className="text-sm text-dark-text-secondary/70 mt-2">
          Real-Time Per-Block sBTC Payroll & Payment Streaming on Stacks
        </p>
        <div className="flex justify-center gap-6 mt-6">
          <a href="#" className="text-vesper-400 hover:text-vesper-300 text-sm transition-colors">
            Privacy
          </a>
          <a href="#" className="text-vesper-400 hover:text-vesper-300 text-sm transition-colors">
            Terms
          </a>
          <a href="https://github.com/Amas-01/Vesper" className="text-vesper-400 hover:text-vesper-300 text-sm transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
