import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileText, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const MAX_SIZE = 20 * 1024 * 1024

export default function FileDropzone({ onFile, disabled }) {
  const [error, setError] = useState(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
    },
    maxSize: MAX_SIZE,
    multiple: false,
    disabled,
    onDropAccepted: (files) => { setError(null); onFile(files[0]) },
    onDropRejected: (rejections) => {
      const rej = rejections[0]
      if (rej.errors[0].code === 'file-too-large') setError('File exceeds 20 MB limit.')
      else if (rej.errors[0].code === 'file-invalid-type') setError('Only .docx and .pdf files are supported.')
      else setError(rej.errors[0].message)
    },
  })

  return (
    <div className="w-full">
      <div {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl px-8 py-16 transition-all duration-200 cursor-pointer text-center
          ${isDragActive ? 'border-accent bg-accent/5 scale-[1.01]' : 'border-ink-300 bg-white hover:border-ink-400 hover:bg-ink-50/50'}
          ${disabled && 'opacity-50 cursor-not-allowed'}`}>
        <input {...getInputProps()} />
        <div className="mx-auto w-16 h-16 rounded-2xl bg-ink-900 text-white grid place-items-center mb-5">
          <UploadCloud size={26} strokeWidth={2} />
        </div>
        <h3 className="font-display text-xl font-semibold text-ink-900 mb-1.5">
          {isDragActive ? 'Release to upload' : 'Drop your document here'}
        </h3>
        <p className="text-sm text-ink-600 mb-6">
          or <span className="text-accent font-medium underline underline-offset-2">browse files</span> from your computer
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><FileText size={14} /> .docx</span>
          <span className="flex items-center gap-1.5"><FileText size={14} /> .pdf</span>
          <span>Max 20 MB</span>
        </div>
      </div>
      {error && (
        <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
