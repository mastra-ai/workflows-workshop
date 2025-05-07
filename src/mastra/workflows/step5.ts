import { init } from '@mastra/inngest'
import { Inngest } from 'inngest'
import { z } from 'zod'

const { createWorkflow, createStep } = init(
  new Inngest({
    id: 'mastra',
    baseUrl: `http://localhost:8288`,
  })
)

const incrementStep = createStep({
  id: 'increment',
  inputSchema: z.object({
    value: z.number(),
  }),
  outputSchema: z.object({
    value: z.number(),
  }),
  execute: async ({ inputData }) => {
    return { value: inputData.value + 1 }
  },
})

const sideEffectStep = createStep({
  id: 'side-effect',
  inputSchema: z.object({
    value: z.number(),
  }),
  outputSchema: z.object({
    value: z.number(),
  }),
  execute: async ({ inputData }) => {
    console.log('log', inputData.value)
    return { value: inputData.value }
  },
})

const finalStep = createStep({
  id: 'final',
  inputSchema: z.object({
    value: z.number(),
  }),
  outputSchema: z.object({
    value: z.number(),
  }),
  execute: async ({ inputData }) => {
    return { value: inputData.value }
  },
})

const workflow = createWorkflow({
  id: 'increment-workflow',
  inputSchema: z.object({
    value: z.number(),
  }),
  outputSchema: z.object({
    value: z.number(),
  }),
})
  .dountil(
    createWorkflow({
      id: 'increment-subworkflow',
      inputSchema: z.object({
        value: z.number(),
      }),
      outputSchema: z.object({
        value: z.number(),
      }),
      steps: [incrementStep, sideEffectStep],
    })
      .then(incrementStep)
      .then(sideEffectStep)
      .commit(),
    async ({ inputData }) => inputData.value >= 10
  )
  .then(finalStep)

workflow.commit()

export { workflow as incrementWorkflow }
