"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Italic, List, ListOrdered, Strikethrough } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { AutocompleteExtension } from "@/extensions/autocomplete-extension"
import { useAuth } from "@/context/auth-context"

export function TiptapEditor() {
  const { idToken } = useAuth()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      AutocompleteExtension.configure({
        fetchSuggestions: async (query: string) => {
          if (!idToken) {
            console.warn("No ID token available for autocomplete.")
            return []
          }
          try {
            const response = await fetch(`http://localhost:8000/autocomplete?query=${query}`, {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            })
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            return data.suggestions || []
          } catch (error) {
            console.error("Error fetching autocomplete suggestions:", error)
            return []
          }
        },
      }),
    ],
    content: `
      <p>MRI LUMBO-SACRAL SPINE</p>
      <p>Protocol:</p>
      <ul>
        <li>Sagittal and Axial T1 and T2 W sequences</li>
        <li>Coronal and Sagittal STIR sequences</li>
        <li>Screening sagittal T1W sequence through cervico-dorsal spine</li>
      </ul>
      <p>OBSERVATIONS:</p>
      <p>Anterior wedge compression of L1 vertebral body noted with loss of up to 40% height.</p>
      <p>Marginal osteophytes are noted at multiple levels.</p>
      <p>Fecalarthropathy noted with ligamentum flavum thickening of lower lumbar levels.</p>
      <p>Note: To add item or revise, click the " + " sign with A...</p>
    `,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none min-h-[300px] p-4 border rounded-md focus:outline-none",
      },
    },
  })

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-2 border-b">
        <Toggle
          size="sm"
          pressed={editor?.isActive("bold")}
          onPressedChange={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("italic")}
          onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("strike")}
          onPressedChange={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="w-4 h-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("bulletList")}
          onPressedChange={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("orderedList")}
          onPressedChange={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </Toggle>
      </div>
      <EditorContent editor={editor} />
      <div className="p-2 text-sm text-muted-foreground">
        Start typing a word (e.g., &quot;Sagittal&quot;, &quot;Anterior&quot;) and press TAB to autocomplete.
      </div>
    </div>
  )
}
