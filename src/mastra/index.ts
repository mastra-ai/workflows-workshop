import { Mastra } from '@mastra/core/mastra'
import { serve as inngestServe } from '@mastra/inngest'
import { createLogger } from '@mastra/core/logger'
import { Inngest } from 'inngest'
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
import { realtimeMiddleware } from '@inngest/realtime'

const inngest = new Inngest({
  id: 'mastra',
  baseUrl: `http://localhost:8288`,
  isDev: true,
  middleware: [realtimeMiddleware()],
})

export const mastra = new Mastra({
  // workflows: {
  //   weatherWorkflow,
  //   step1Workflow,
  //   step2Workflow,
  //   step3Workflow,
  //   step4Workflow,
  //   step5Workflow,
  // },
  vnext_workflows: {
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
  server: {
    host: '0.0.0.0',
    apiRoutes: [
      {
        path: '/inngest/api',
        method: 'ALL',
        createHandler: async ({ mastra }) => inngestServe({ mastra, inngest }),
      },
    ],
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
})
