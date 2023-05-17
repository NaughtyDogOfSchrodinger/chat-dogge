import { SearchResult } from '@/pages/api/chat/search/web_search'

export const SAVED_PROMPTS_KEY = 'saved_prompts'
export const SAVED_PROMPTS_MOVED_KEY = 'saved_prompts_moved_to_local'

export interface Prompt {
  uuid?: string
  name: string
  text: string
}

const removeCommands = (query: string) =>
  query.replace(/\/page:(\S+)\s*/g, '').replace(/\/site:(\S+)\s*/g, '')

const template =
  'Web search results:\n\n{web_results}\nCurrent date: {current_date}\n\nInstructions: Using the provided web search results, write a comprehensive reply to the given query. Make sure to cite results using [[number](URL)] notation after the reference. If the provided search results refer to multiple subjects with the same name, write separate answers for each subject.\nQuery: {query} \nReply in 中文'

export const compilePrompt = (
  results: SearchResult[] | undefined,
  query: string
) => {
  const prompt = replaceVariables(template, {
    '{web_results}': formatWebResults(results),
    '{query}': removeCommands(query),
    '{current_date}': new Date().toLocaleDateString(),
  })
  return prompt
}

const formatWebResults = (results: SearchResult[] | undefined) => {
  if (!results) {
    return ''
  }

  if (results.length === 0) {
    return 'No results found.\n'
  }

  let counter = 1
  return results.reduce(
    (acc, result): string =>
      (acc += `[${counter++}] "${result.body}"\nURL: ${result.url}\n\n`),
    ''
  )
}

const replaceVariables = (
  prompt: string,
  variables: { [key: string]: string }
) => {
  let newPrompt = prompt
  for (const key in variables) {
    try {
      // @ts-ignore
      newPrompt = newPrompt.replaceAll(key, variables[key])
    } catch (error) {
      console.info('WebChatGPT error --> API error: ', error)
    }
  }
  return newPrompt
}
