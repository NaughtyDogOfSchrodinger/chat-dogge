import cheerio from 'cheerio'
import { getWebpageTitleAndText } from '@/pages/api/chat/search/api'
import axios from 'axios'
import { httpsAgent } from '@/service/utils/tools'

const BASE_URL = 'https://sg.search.yahoo.com/search'

export interface SearchRequest {
  query: string
  timerange: string
  region: string
}

export interface SearchResponse {
  status: number
  html: string
  url: string
}

export interface SearchResult {
  title: string
  body: string
  url: string
}

export async function getHtml({
  query,
  timerange,
}: SearchRequest): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    btf: timerange,
    nojs: '1',
    ei: 'UTF-8',
  })
  const url = `${BASE_URL}?${params.toString()}`
  const response = await axios
    .get(`${BASE_URL}?${params.toString()}`, {
      httpsAgent: httpsAgent(true),
    })
    .then((res) => res)
  if (response.status != 200) {
    throw new Error(
      `Failed to fetch: ${response.status} ${response.statusText}`
    )
  }

  return {
    status: response.status,
    html: response.data,
    url: response.config.url || '',
  }
}

function extractRealUrl(url: string): string {
  const match = url.match(/RU=([^/]+)/)
  if (match && match[1]) {
    return decodeURIComponent(match[1])
  }

  return url
}

function htmlToSearchResults(html: string, numResults: number): SearchResult[] {
  const $ = cheerio.load(html)
  const results: SearchResult[] = []

  const rightPanel = $('#right .searchRightTop')
  if (rightPanel.length) {
    const rightPanelLink = rightPanel.find('.compText a').first()
    const rightPanelInfo = rightPanel.find('.compInfo li')
    const rightPanelInfoText = rightPanelInfo
      .map((_, el) => $(el).text().trim())
      .get()
      .join('\n')

    results.push({
      title: rightPanelLink.text().trim(),
      body: `${rightPanel.find('.compText').text().trim()}${
        rightPanelInfoText ? `\n\n${rightPanelInfoText}` : ''
      }`,
      url: extractRealUrl(rightPanelLink.attr('href') ?? ''),
    })
  }

  $('.algo-sr:not([class*="ad"])')
    .slice(0, numResults)
    .each((_, el) => {
      const element = $(el)
      const titleElement = element.find('h3.title a')

      results.push({
        title: titleElement.attr('aria-label') ?? '',
        body: element.find('.compText').text().trim(),
        url: extractRealUrl(titleElement.attr('href') ?? ''),
      })
    })

  return results
}

export async function webSearch(
  search: SearchRequest,
  numResults: number
): Promise<SearchResult[]> {
  const response: SearchResponse = await getHtml(search)

  let results: SearchResult[]
  if (response.url.startsWith(BASE_URL)) {
    results = htmlToSearchResults(response.html, numResults)
  } else {
    const result = await getWebpageTitleAndText(response.url, response.html)

    return [
      {
        title: result.title,
        body: result.body,
        url: response.url,
      },
    ]
  }

  return results
}
