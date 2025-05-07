import { init } from '@mastra/inngest'
import { Inngest } from 'inngest'
import { z } from 'zod'

const { createWorkflow, createStep } = init(
  new Inngest({
    id: 'mastra',
    baseUrl: `http://localhost:8288`,
  })
)

import { weatherTool } from '../tools'
import { weatherReporterAgent } from '../agents'

const fetchWeather = createStep(weatherTool)
const reportWeather = createStep(weatherReporterAgent)

const weatherWorkflow = createWorkflow({
  steps: [fetchWeather, reportWeather],
  id: 'weather-workflow-step6',
  inputSchema: z.object({
    location: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: z.object({
    text: z.string(),
  }),
})
  .then(fetchWeather)
  .then(
    createStep({
      id: 'report-weather',
      inputSchema: fetchWeather.outputSchema,
      outputSchema: z.object({
        text: z.string(),
      }),
      execute: async ({ inputData, mastra }) => {
        const prompt = 'Forecast data: ' + JSON.stringify(inputData)
        const agent = mastra.getAgent('weatherReporterAgent')
        const result = await agent.generate([
          {
            role: 'user',
            content: prompt,
          },
        ])
        return { text: result.text }
      },
    })
  )

weatherWorkflow.commit()

export { weatherWorkflow }
