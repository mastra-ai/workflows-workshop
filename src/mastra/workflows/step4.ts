import { createWorkflow, createStep } from '@mastra/core/workflows'

import { z } from 'zod'

const generateSuggestionsStep = createStep({
  id: 'generate-suggestions',
  inputSchema: z.object({
    vacationDescription: z.string().describe('The description of the vacation'),
  }),
  outputSchema: z.object({
    suggestions: z.array(
      z.object({
        location: z.string(),
        description: z.string(),
      })
    ),
  }),
  execute: async ({ inputData, mastra }) => {
    const { vacationDescription } = inputData
    const result = await mastra.getAgent('summaryTravelAgent').generate(
      [
        {
          role: 'user',
          content: `Generate 3 suggestions for: ${vacationDescription}`,
        },
      ],
      {
        output: z.object({
          suggestions: z.array(
            z.object({
              location: z.string(),
              description: z.string(),
            })
          ),
        }),
      }
    )
    console.log(result.object)
    return { suggestions: result.object?.suggestions || [] }
  },
})

const humanInputStep = createStep({
  id: 'human-input',
  inputSchema: z.object({
    suggestions: z.array(
      z.object({
        location: z.string(),
        description: z.string(),
      })
    ),
  }),
  outputSchema: z.object({
    selection: z.string().describe('The selection of the user'),
  }),
  resumeSchema: z.object({
    selection: z.string().describe('The selection of the user'),
  }),
  suspendSchema: z.object({
    suggestions: z.array(
      z.object({
        location: z.string(),
        description: z.string(),
      })
    ),
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    if (!resumeData?.selection) {
      return await suspend({ suggestions: inputData?.suggestions })
    }

    return {
      selection: resumeData?.selection,
    }
  },
})

const travelPlannerStep = createStep({
  id: 'travel-planner',
  inputSchema: z.object({
    selection: z.string().describe('The selection of the user'),
  }),
  outputSchema: z.object({
    travelPlan: z.string(),
  }),
  execute: async ({ inputData, mastra, getInitData }) => {
    const { vacationDescription } = getInitData()

    const travelAgent = mastra.getAgent('travelAgent')

    const { selection } = inputData
    const result = await travelAgent.generate([
      { role: 'assistant', content: vacationDescription },
      { role: 'user', content: selection || '' },
    ])
    console.log(result.text)
    return { travelPlan: result.text }
  },
})

const travelAgentWorkflow = createWorkflow({
  id: 'travel-agent-workflow-step4-suspend-resume',
  inputSchema: z.object({
    vacationDescription: z.string().describe('The description of the vacation'),
  }),
  outputSchema: z.object({
    travelPlan: z.string(),
  }),
})
  .then(generateSuggestionsStep)
  .then(humanInputStep)
  .then(travelPlannerStep)

travelAgentWorkflow.commit()

export { travelAgentWorkflow as weatherWorkflow, humanInputStep }
