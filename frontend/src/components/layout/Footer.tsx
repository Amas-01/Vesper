export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-slate-500">
        <p>© 2026 Vesper Protocol. All rights reserved.</p>
        <p className="text-sm mt-2">Real-Time Per-Block sBTC Payroll & Payment Streaming on Stacks</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="#" className="text-vesper-600 hover:underline text-sm">Privacy</a>
          <a href="#" className="text-vesper-600 hover:underline text-sm">Terms</a>
          <a href="https://github.com/Amas-01/Vesper" className="text-vesper-600 hover:underline text-sm">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
