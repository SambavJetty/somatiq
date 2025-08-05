import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

interface AutocompleteOptions {
  fetchSuggestions: (query: string) => Promise<string[]>
  debounceTime?: number
}

interface AutocompletePluginState {
  query: string | null
  suggestion: string | null
  from: number | null
  to: number | null
}

const AutocompletePluginKey = new PluginKey("autocomplete")

export const AutocompleteExtension = Extension.create<AutocompleteOptions>({
  name: "autocomplete",

  addOptions() {
    return {
      fetchSuggestions: async () => [],
      debounceTime: 300,
    }
  },

  addProseMirrorPlugins() {
    const timeout: NodeJS.Timeout | null = null

    return [
      new Plugin({
        key: AutocompletePluginKey,
        state: {
          init() {
            return { query: null, suggestion: null, from: null, to: null }
          },
          apply(tr, value: AutocompletePluginState, oldState, newState) {
            const meta = tr.getMeta(AutocompletePluginKey)
            if (meta) {
              return {
                query: meta.query,
                suggestion: meta.suggestion,
                from: meta.from,
                to: meta.to,
              }
            }
            if (tr.docChanged || !newState.selection.eq(oldState.selection)) {
              return { query: null, suggestion: null, from: null, to: null }
            }
            return value
          },
        },
        props: {
          decorations(state) {
            const { query, suggestion, from, to } = AutocompletePluginKey.getState(state) as AutocompletePluginState

            if (!query || !suggestion || from === null || to === null) {
              return DecorationSet.empty
            }

            const suffix = suggestion.substring(query.length)
            if (!suffix) {
              return DecorationSet.empty
            }

            return DecorationSet.create(state.doc, [
              Decoration.inline(
                to,
                to + suffix.length,
                {
                  class: "text-muted-foreground opacity-50",
                },
                {
                  nodeName: "span",
                  inclusiveEnd: true,
                  side: 1, 
                },
              ),
            ])
          },
        },
        view: (view) => {
          let timeout: NodeJS.Timeout | null = null

          return {
            update: (updatedView, prevState) => {
              const { state } = updatedView
              const { selection } = state
              const { $from } = selection
              if (!selection.empty) {
                if (timeout) clearTimeout(timeout)
                const currentPluginState = AutocompletePluginKey.getState(state) as AutocompletePluginState
                if (currentPluginState.query || currentPluginState.suggestion) {
                  view.dispatch(
                    view.state.tr.setMeta(AutocompletePluginKey, {
                      query: null,
                      suggestion: null,
                      from: null,
                      to: null,
                    }),
                  )
                }
                return
              }

              const pos = $from.pos
              const textBefore = state.doc.textBetween(Math.max(0, pos - 20), pos) 
              const wordMatch = textBefore.match(/(\w+)$/)
              const currentWord = wordMatch ? wordMatch[1] : null
              const currentWordFrom = wordMatch ? pos - wordMatch[1].length : null
              const currentWordTo = pos 

              const currentPluginState = AutocompletePluginKey.getState(state) as AutocompletePluginState

              if (currentWord && currentWord.length > 0 && currentWordFrom !== null && currentWordTo !== null) {
                if (
                  currentWord !== currentPluginState.query ||
                  currentWordFrom !== currentPluginState.from ||
                  currentWordTo !== currentPluginState.to
                ) {
                  if (timeout) clearTimeout(timeout)
                  timeout = setTimeout(async () => {
                    const latestState = view.state
                    const latestPluginState = AutocompletePluginKey.getState(latestState) as AutocompletePluginState
                    const latestSelection = latestState.selection
                    const latest$from = latestSelection.$from
                    const latestPos = latest$from.pos
                    const latestTextBefore = latestState.doc.textBetween(Math.max(0, latestPos - 20), latestPos)
                    const latestWordMatch = latestTextBefore.match(/(\w+)$/)
                    const latestWord = latestWordMatch ? latestWordMatch[1] : null
                    const latestWordFrom = latestWordMatch ? latestPos - latestWordMatch[1].length : null
                    const latestWordTo = latestPos

                    if (
                      latestWord &&
                      latestWord === currentWord &&
                      latestWordFrom === currentWordFrom &&
                      latestWordTo === currentWordTo
                    ) {
                      const suggestions = await this.options.fetchSuggestions(latestWord)
                      const bestSuggestion = suggestions.find((s) =>
                        s.toLowerCase().startsWith(latestWord.toLowerCase()),
                      )
                      const newQuery = bestSuggestion ? latestWord : null
                      const newSuggestion = bestSuggestion || null
                      const newFrom = bestSuggestion ? latestWordFrom : null
                      const newTo = bestSuggestion ? latestWordTo : null

                      if (
                        newQuery !== latestPluginState.query ||
                        newSuggestion !== latestPluginState.suggestion ||
                        newFrom !== latestPluginState.from ||
                        newTo !== latestPluginState.to
                      ) {
                        const tr = view.state.tr.setMeta(AutocompletePluginKey, {
                          query: newQuery,
                          suggestion: newSuggestion,
                          from: newFrom,
                          to: newTo,
                        })
                        view.dispatch(tr)
                      }
                    } else {
                      if (latestPluginState.query || latestPluginState.suggestion) {
                        view.dispatch(
                          view.state.tr.setMeta(AutocompletePluginKey, {
                            query: null,
                            suggestion: null,
                            from: null,
                            to: null,
                          }),
                        )
                      }
                    }
                  }, this.options.debounceTime)
                }
              } else if (currentPluginState.query || currentPluginState.suggestion) {
                if (timeout) clearTimeout(timeout) 
                view.dispatch(
                  view.state.tr.setMeta(AutocompletePluginKey, { query: null, suggestion: null, from: null, to: null }),
                )
              }
            },
          }
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const { state, view } = editor
        const { selection } = state
        const { $from } = selection

        const { query, suggestion, from, to } = AutocompletePluginKey.getState(state) as AutocompletePluginState

        if (query && suggestion && from !== null && to !== null && selection.empty && $from.pos === to) {
          const suffix = suggestion.substring(query.length)
          if (suffix) {
            const tr = state.tr.replaceWith(to, to, state.schema.text(suffix))
            tr.setMeta(AutocompletePluginKey, { query: null, suggestion: null, from: null, to: null })
            view.dispatch(tr)
            return true
          }
        }
        return false
      },
    }
  },
})
