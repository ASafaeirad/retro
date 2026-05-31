import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),

  sessions: defineTable({
    sprintNumber: v.number(),
    phase: v.union(
      v.literal("REVIEW_ACTIONS"),
      v.literal("ADD_TICKETS"),
      v.literal("PRESENT"),
      v.literal("GROUP"),
      v.literal("VOTE"),
      v.literal("DISCUSS"),
      v.literal("COMPLETED"),
    ),
    createdBy: v.string(), // participant name (scrum master)
    voteLimit: v.optional(v.number()),
    currentPresenter: v.optional(v.string()), // participant name currently presenting
    timerState: v.optional(
      v.object({
        startedAt: v.number(),
        duration: v.number(), // milliseconds
        isPaused: v.boolean(),
        pausedAt: v.optional(v.number()),
      }),
    ),
    currentDiscussionTicket: v.optional(v.id("tickets")),
    isActive: v.boolean(), // false when completed
  })
    .index("sprintNumber", ["sprintNumber"])
    .index("isActive", ["isActive"]),

  participants: defineTable({
    sessionId: v.id("sessions"),
    name: v.string(),
    isReady: v.boolean(),
    joinedAt: v.number(),
    sessionToken: v.optional(v.string()),
    lastActiveAt: v.number(),
    mood: v.optional(v.string()),
  })
    .index("sessionId", ["sessionId"])
    .index("sessionAndName", ["sessionId", "name"])
    .index("sessionAndToken", ["sessionId", "sessionToken"]),

  tickets: defineTable({
    sessionId: v.id("sessions"),
    text: v.string(),
    author: v.string(), // participant name
    category: v.union(v.literal("well"), v.literal("improve")),
    imageUrl: v.optional(v.string()),
    order: v.number(), // for sorting
  })
    .index("sessionId", ["sessionId"])
    .index("sessionAndCategory", ["sessionId", "category"]),

  votes: defineTable({
    sessionId: v.id("sessions"),
    participantName: v.string(),
    ticketId: v.optional(v.id("tickets")),
  })
    .index("sessionId", ["sessionId"])
    .index("sessionAndParticipant", ["sessionId", "participantName"])
    .index("ticketId", ["ticketId"]),

  actionItems: defineTable({
    text: v.string(),
    assignee: v.optional(v.string()), // participant name
    createdInSession: v.id("sessions"),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    relatedTicketId: v.optional(v.id("tickets")),
  }).index("createdInSession", ["createdInSession"]),
});
