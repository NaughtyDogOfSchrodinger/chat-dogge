import type MarkdownIt from 'markdown-it'

export default function preWrapperPlugin(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]
    // remove title from info
    // @ts-ignore
    token.info = token.info.replace(/\[.*\]/, '')
    // @ts-ignore
    const lang = extractLang(token.info)
    const rawCode = fence(...args)
    return rawCode.replace(
      '<pre>',
      `<pre style="position: relative"><span class="lang">${lang}</span>`
    )
  }
}

export function extractTitle(info: string) {
  return info.match(/\[(.*)\]/)?.[1] || extractLang(info) || 'txt'
}

const extractLang = (info: string) => {
  return info.trim().replace(/:(no-)?line-numbers({| |$).*/, '')
}
