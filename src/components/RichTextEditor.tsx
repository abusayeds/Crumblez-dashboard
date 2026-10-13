import { useEffect, useRef, useState } from 'react'
import { uploadImage } from '../lib/api'

// A dependency-free WYSIWYG built on contentEditable + document.execCommand.
// execCommand is deprecated but is the only API every browser still implements
// for this, and it keeps the dashboard free of a heavyweight editor framework.

type Props = {
  value: string
  onChange: (html: string) => void
}

const FONTS = [
  'Inter',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
]

const SIZES = [
  { label: 'Tiny', value: '1' },
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Medium', value: '4' },
  { label: 'Large', value: '5' },
  { label: 'Huge', value: '6' },
  { label: 'Giant', value: '7' },
]

const BLOCKS = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
  { label: 'Quote', value: 'blockquote' },
  { label: 'Code block', value: 'pre' },
]

const toolbarBtn =
  'cursor-pointer rounded-[8px] border border-border-soft bg-white px-[0.5rem] py-[0.3rem] text-[0.8rem] text-ink hover:bg-blue-soft'

const toolbarSelect =
  'cursor-pointer rounded-[8px] border border-border-soft bg-white px-[0.4rem] py-[0.3rem] text-[0.8rem] text-ink'

const toolbarGroup =
  'flex flex-wrap items-center gap-[0.3rem] border-r border-border-soft pr-[0.5rem] last:border-r-0 last:pr-0'

// Preview typography inside the editable area. The storefront applies its own
// styles when rendering, so this only needs to make editing legible.
const editorTypography = [
  '[&_h1]:mb-3 [&_h1]:mt-4 [&_h1]:text-[1.75rem] [&_h1]:font-bold',
  '[&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:text-[1.4rem] [&_h2]:font-bold',
  '[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-[1.15rem] [&_h3]:font-bold',
  '[&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:font-bold',
  '[&_p]:my-[0.7rem]',
  '[&_ul]:my-[0.7rem] [&_ul]:list-disc [&_ul]:pl-[1.5rem]',
  '[&_ol]:my-[0.7rem] [&_ol]:list-decimal [&_ol]:pl-[1.5rem]',
  '[&_li]:my-[0.25rem]',
  '[&_a]:text-blue [&_a]:underline',
  '[&_blockquote]:my-[0.8rem] [&_blockquote]:border-l-4 [&_blockquote]:border-border-soft [&_blockquote]:pl-[0.9rem] [&_blockquote]:text-muted',
  '[&_pre]:my-[0.8rem] [&_pre]:overflow-x-auto [&_pre]:rounded-[8px] [&_pre]:bg-surface-2 [&_pre]:p-[0.8rem] [&_pre]:font-mono [&_pre]:text-[0.8rem]',
  '[&_img]:my-[0.6rem] [&_img]:max-w-full [&_img]:rounded-[8px]',
  '[&_table]:my-[0.9rem] [&_table]:w-full [&_table]:border-collapse',
  '[&_hr]:my-[1rem] [&_hr]:border-border-soft',
].join(' ')

export function RichTextEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showSource, setShowSource] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Wrap new lines in <p> instead of <div>, and emit inline styles for colors
    // and fonts rather than deprecated <font> tags.
    document.execCommand('defaultParagraphSeparator', false, 'p')
    document.execCommand('styleWithCSS', false, 'true')
  }, [])

  // Only push external values in when they differ, so typing never resets the
  // caret position.
  useEffect(() => {
    const el = editorRef.current
    if (!el || showSource) return
    if (el.innerHTML !== value) el.innerHTML = value
  }, [value, showSource])

  function exec(command: string, arg?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, arg)
    emit()
  }

  function emit() {
    const el = editorRef.current
    if (el) onChange(el.innerHTML)
  }

  function onLink() {
    const url = window.prompt('Link URL (use /content/privacy for internal pages)')
    if (!url) return
    exec('createLink', url)
  }

  async function onImage(file?: File) {
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadImage(file)
      exec('insertImage', res.url)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  function onTable() {
    const cols = Number(window.prompt('Columns', '3'))
    const rows = Number(window.prompt('Rows (excluding header)', '3'))
    if (!cols || !rows || cols < 1 || rows < 1) return

    const cell = 'border:1px solid #cbd5e1;padding:8px;'
    const head = `<tr>${Array.from({ length: cols }, (_, i) => `<th style="${cell}background:#f1f5f9;">Heading ${i + 1}</th>`).join('')}</tr>`
    const body = Array.from(
      { length: rows },
      () => `<tr>${Array.from({ length: cols }, () => `<td style="${cell}">&nbsp;</td>`).join('')}</tr>`,
    ).join('')

    exec(
      'insertHTML',
      `<table style="border-collapse:collapse;width:100%;margin:16px 0;"><thead>${head}</thead><tbody>${body}</tbody></table><p><br></p>`,
    )
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-border-soft bg-white">
      <div className="flex flex-wrap items-center gap-[0.5rem] border-b border-border-soft bg-blue-soft px-[0.6rem] py-[0.5rem]">
        <div className={toolbarGroup}>
          <select
            aria-label="Text style"
            className={toolbarSelect}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) exec('formatBlock', e.target.value)
              e.target.value = ''
            }}
          >
            <option value="">Style</option>
            {BLOCKS.map((block) => (
              <option key={block.value} value={block.value}>
                {block.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Font"
            className={toolbarSelect}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) exec('fontName', e.target.value)
              e.target.value = ''
            }}
          >
            <option value="">Font</option>
            {FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <select
            aria-label="Font size"
            className={toolbarSelect}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) exec('fontSize', e.target.value)
              e.target.value = ''
            }}
          >
            <option value="">Size</option>
            {SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        <div className={toolbarGroup}>
          <button className={`${toolbarBtn} font-bold`} onClick={() => exec('bold')} title="Bold" type="button">
            B
          </button>
          <button className={`${toolbarBtn} italic`} onClick={() => exec('italic')} title="Italic" type="button">
            I
          </button>
          <button className={`${toolbarBtn} underline`} onClick={() => exec('underline')} title="Underline" type="button">
            U
          </button>
          <button className={`${toolbarBtn} line-through`} onClick={() => exec('strikeThrough')} title="Strikethrough" type="button">
            S
          </button>
          <button className={toolbarBtn} onClick={() => exec('removeFormat')} title="Clear formatting" type="button">
            Clear
          </button>
        </div>

        <div className={toolbarGroup}>
          <label className="flex items-center gap-[0.25rem] text-[0.8rem] text-muted" title="Text color">
            A
            <input
              aria-label="Text color"
              className="size-[26px] cursor-pointer rounded-[6px] border border-border-soft bg-white p-0"
              onChange={(e) => exec('foreColor', e.target.value)}
              type="color"
            />
          </label>
          <label className="flex items-center gap-[0.25rem] text-[0.8rem] text-muted" title="Highlight color">
            BG
            <input
              aria-label="Highlight color"
              className="size-[26px] cursor-pointer rounded-[6px] border border-border-soft bg-white p-0"
              onChange={(e) => exec('hiliteColor', e.target.value)}
              type="color"
            />
          </label>
        </div>

        <div className={toolbarGroup}>
          <button className={toolbarBtn} onClick={() => exec('justifyLeft')} title="Align left" type="button">
            ⇤
          </button>
          <button className={toolbarBtn} onClick={() => exec('justifyCenter')} title="Align center" type="button">
            ↔
          </button>
          <button className={toolbarBtn} onClick={() => exec('justifyRight')} title="Align right" type="button">
            ⇥
          </button>
          <button className={toolbarBtn} onClick={() => exec('justifyFull')} title="Justify" type="button">
            ☰
          </button>
        </div>

        <div className={toolbarGroup}>
          <button className={toolbarBtn} onClick={() => exec('insertUnorderedList')} title="Bullet list" type="button">
            • List
          </button>
          <button className={toolbarBtn} onClick={() => exec('insertOrderedList')} title="Numbered list" type="button">
            1. List
          </button>
          <button className={toolbarBtn} onClick={() => exec('outdent')} title="Outdent" type="button">
            ◀
          </button>
          <button className={toolbarBtn} onClick={() => exec('indent')} title="Indent" type="button">
            ▶
          </button>
        </div>

        <div className={toolbarGroup}>
          <button className={toolbarBtn} onClick={onLink} title="Insert link" type="button">
            Link
          </button>
          <button className={toolbarBtn} onClick={() => exec('unlink')} title="Remove link" type="button">
            Unlink
          </button>
          <button className={toolbarBtn} onClick={onTable} title="Insert table" type="button">
            Table
          </button>
          <button
            className={toolbarBtn}
            onClick={() => exec('insertHorizontalRule')}
            title="Divider"
            type="button"
          >
            ―
          </button>
          <label className={`${toolbarBtn} inline-flex`} title="Insert image">
            {uploading ? 'Uploading…' : 'Image'}
            <input
              accept="image/*"
              className="hidden"
              onChange={(e) => onImage(e.target.files?.[0])}
              type="file"
            />
          </label>
        </div>

        <div className={toolbarGroup}>
          <button className={toolbarBtn} onClick={() => exec('undo')} title="Undo" type="button">
            ↶
          </button>
          <button className={toolbarBtn} onClick={() => exec('redo')} title="Redo" type="button">
            ↷
          </button>
          <button
            className={`${toolbarBtn} ${showSource ? 'bg-blue text-white' : ''}`}
            onClick={() => setShowSource((prev) => !prev)}
            title="Edit raw HTML"
            type="button"
          >
            HTML
          </button>
        </div>
      </div>

      {showSource ? (
        <textarea
          aria-label="HTML source"
          className="block min-h-[420px] w-full resize-y border-0 bg-white p-[1rem] font-mono text-[0.8rem] leading-relaxed text-ink outline-none"
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          value={value}
        />
      ) : (
        <div
          aria-label="Page content"
          className={`min-h-[420px] max-h-[70vh] overflow-y-auto p-[1rem] text-ink outline-none ${editorTypography}`}
          contentEditable
          onBlur={emit}
          onInput={emit}
          ref={editorRef}
          role="textbox"
          suppressContentEditableWarning
        />
      )}
    </div>
  )
}
