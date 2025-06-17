import { Mastra } from '@mastra/core/mastra'
import { serve } from '@mastra/inngest'
import { realtimeMiddleware } from '@inngest/realtime'
import { DefaultStorage } from '@mastra/libsql'
import { weatherWorkflow as step1Workflow } from './workflows/step1'
import { weatherWorkflow as step2Workflow } from './workflows/step2'
import { weatherWorkflow as step3Workflow } from './workflows/step3'
import { weatherWorkflow as step4Workflow } from './workflows/step4'
import {
  weatherAgent,
  synthesizeAgent,
  activityPlannerAgent,
  weatherReporterAgent,
} from './agents'
import { summaryAgent, travelAgent } from './agents/travelAgent'
import { planningAgent } from './agents/planning'
import { incrementWorkflow as step5Workflow } from './workflows/step5'
import { researchAgent, factCheckAgent, editorAgent } from './agents/network'
import { weatherWorkflow as step6Workflow } from './workflows/step6'
import { Inngest } from 'inngest'

const storage = new DefaultStorage({
  url: ':memory:',
})

export const mastra = new Mastra({
  workflows: {
    step1Workflow,
    step2Workflow,
    step3Workflow,
    step4Workflow,
    step5Workflow,
    step6Workflow,
  },
  agents: {
    activityPlannerAgent,
    weatherAgent,
    summaryTravelAgent: summaryAgent,
    travelAgent,
    planningAgent,
    synthesizeAgent,
    researchAgent,
    factCheckAgent,
    editorAgent,
    weatherReporterAgent,
  },
  storage,
  server: {
    host: '0.0.0.0',
    apiRoutes: [
      {
        path: '/inngest/api',
        method: 'ALL',
        createHandler: async ({ mastra }) =>
          serve({
            mastra,
            inngest: new Inngest({
              id: 'mastra',
              baseUrl: 'http://localhost:8288',
              isDev: true,
              middleware: [realtimeMiddleware()],
            }),
          }),
      },
    ],
  },
})
