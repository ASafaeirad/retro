import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// ===== QUERIES =====

export const listSessions = query({
  args: { includeCompleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const includeCompleted = args.includeCompleted ?? false

    const sessions = includeCompleted
      ? await ctx.db.query('sessions').order('desc').collect()
      : await ctx.db
          .query('sessions')
          .withIndex('isActive', (q) => q.eq('isActive', true))
          .order('desc')
          .collect()

    // Attach participant count to each session
    return await Promise.all(
      sessions.map(async (session) => {
        const participantCount = (
          await ctx.db
            .query('participants')
            .withIndex('sessionId', (q) => q.eq('sessionId', session._id))
            .collect()
        ).length

        return {
          ...session,
          participantCount,
        }
      })
    )
  },
})

export const getSession = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId)
  },
})

export const getParticipants = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('participants')
      .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
      .order('asc')
      .collect()
  },
})

export const getTickets = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query('tickets')
      .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
      .collect()

    // Attach vote counts to each ticket
    return await Promise.all(
      tickets.map(async (ticket) => {
        const voteLimit = (
          await ctx.db
            .query('votes')
            .withIndex('ticketId', (q) => q.eq('ticketId', ticket._id))
            .collect()
        ).length

        return {
          ...ticket,
          voteLimit,
        }
      })
    )
  },
})

export const getTicketGroups = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query('ticketGroups')
      .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
      .collect()

    // Attach tickets and vote counts to each group
    return await Promise.all(
      groups.map(async (group) => {
        const tickets = await ctx.db
          .query('tickets')
          .withIndex('groupId', (q) => q.eq('groupId', group._id))
          .collect()

        const voteLimit = (
          await ctx.db
            .query('votes')
            .withIndex('groupId', (q) => q.eq('groupId', group._id))
            .collect()
        ).length

        return {
          ...group,
          tickets,
          voteLimit,
        }
      })
    )
  },
})

export const getVotes = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('votes')
      .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
      .collect()
  },
})

export const getParticipantVotes = query({
  args: { sessionId: v.id('sessions'), participantName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('votes')
      .withIndex('sessionAndParticipant', (q) =>
        q.eq('sessionId', args.sessionId).eq('participantName', args.participantName)
      )
      .collect()
  },
})

export const getActionItems = query({
  args: { sprintNumber: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('actionItems')
      .withIndex('createdInSprint', (q) => q.eq('createdInSprint', args.sprintNumber))
      .collect()
  },
})

// ===== MUTATIONS =====

export const createSession = mutation({
  args: {
    sprintNumber: v.number(),
    creatorName: v.string(),
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Create the session
    const sessionId = await ctx.db.insert('sessions', {
      sprintNumber: args.sprintNumber,
      phase: 'REVIEW_ACTIONS',
      createdBy: args.creatorName,
      isActive: true,
    })

    // Add creator as first participant (scrum master)
    await ctx.db.insert('participants', {
      sessionId,
      name: args.creatorName,
      isReady: false,
      joinedAt: Date.now(),
      sessionToken: args.sessionToken,
      lastActiveAt: Date.now(),
    })

    return sessionId
  },
})

export const joinSession = mutation({
  args: {
    sessionId: v.id('sessions'),
    name: v.string(),
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check if participant already exists
    const existing = await ctx.db
      .query('participants')
      .withIndex('sessionAndName', (q) => q.eq('sessionId', args.sessionId).eq('name', args.name))
      .first()

    if (existing) {
      // If participant exists, validate token to allow rejoin
      if (existing.sessionToken === args.sessionToken) {
        // Valid token - update lastActiveAt and return existing participant ID
        await ctx.db.patch(existing._id, {
          lastActiveAt: now,
          joinedAt: now, // Update rejoin time
        })
        return existing._id
      } else {
        // Token mismatch
        throw new Error('Participant with this name already exists in this session')
      }
    }

    // New participant - create record
    return await ctx.db.insert('participants', {
      sessionId: args.sessionId,
      name: args.name,
      isReady: false,
      joinedAt: now,
      sessionToken: args.sessionToken,
      lastActiveAt: now,
    })
  },
})

export const toggleReady = mutation({
  args: {
    sessionId: v.id('sessions'),
    participantName: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query('participants')
      .withIndex('sessionAndName', (q) =>
        q.eq('sessionId', args.sessionId).eq('name', args.participantName)
      )
      .first()

    if (!participant) {
      throw new Error('Participant not found')
    }

    await ctx.db.patch(participant._id, {
      isReady: !participant.isReady,
    })
  },
})

export const addTicket = mutation({
  args: {
    sessionId: v.id('sessions'),
    text: v.string(),
    author: v.string(),
    category: v.union(v.literal('well'), v.literal('improve')),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current ticket count for ordering
    const tickets = await ctx.db
      .query('tickets')
      .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
      .collect()

    return await ctx.db.insert('tickets', {
      sessionId: args.sessionId,
      text: args.text,
      author: args.author,
      category: args.category,
      imageUrl: args.imageUrl,
      order: tickets.length,
    })
  },
})

export const updatePhase = mutation({
  args: {
    sessionId: v.id('sessions'),
    phase: v.union(
      v.literal('REVIEW_ACTIONS'),
      v.literal('ADD_TICKETS'),
      v.literal('PRESENT'),
      v.literal('GROUP'),
      v.literal('VOTE'),
      v.literal('DISCUSS'),
      v.literal('COMPLETED')
    ),
    requestedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    // Verify scrum master
    if (session.createdBy !== args.requestedBy) {
      throw new Error('Only scrum master can change phase')
    }

    await ctx.db.patch(args.sessionId, { phase: args.phase })

    // If completing session, mark as inactive
    if (args.phase === 'COMPLETED') {
      await ctx.db.patch(args.sessionId, { isActive: false })
    }

    // Reset ready status when entering ADD_TICKETS phase
    if (args.phase === 'ADD_TICKETS') {
      const participants = await ctx.db
        .query('participants')
        .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
        .collect()

      for (const participant of participants) {
        await ctx.db.patch(participant._id, { isReady: false })
      }
    }
  },
})

export const setCurrentPresenter = mutation({
  args: {
    sessionId: v.id('sessions'),
    presenterName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      currentPresenter: args.presenterName,
    })
  },
})

export const createGroup = mutation({
  args: {
    sessionId: v.id('sessions'),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('ticketGroups', {
      sessionId: args.sessionId,
      name: args.name,
    })
  },
})

export const addTicketToGroup = mutation({
  args: {
    ticketId: v.id('tickets'),
    groupId: v.optional(v.id('ticketGroups')),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      groupId: args.groupId,
    })
  },
})

export const castVote = mutation({
  args: {
    sessionId: v.id('sessions'),
    participantName: v.string(),
    ticketId: v.optional(v.id('tickets')),
    groupId: v.optional(v.id('ticketGroups')),
  },
  handler: async (ctx, args) => {
    if (!args.ticketId && !args.groupId) {
      throw new Error('Must vote on either a ticket or a group')
    }

    // Check vote limit
    const session = await ctx.db.get(args.sessionId)
    if (session?.voteLimit) {
      const existingVotes = await ctx.db
        .query('votes')
        .withIndex('sessionAndParticipant', (q) =>
          q.eq('sessionId', args.sessionId).eq('participantName', args.participantName)
        )
        .collect()

      if (existingVotes.length >= session.voteLimit) {
        throw new Error('Vote limit reached')
      }
    }

    return await ctx.db.insert('votes', {
      sessionId: args.sessionId,
      participantName: args.participantName,
      ticketId: args.ticketId,
      groupId: args.groupId,
    })
  },
})

export const removeVote = mutation({
  args: { voteId: v.id('votes') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.voteId)
  },
})

export const setvoteLimit = mutation({
  args: {
    sessionId: v.id('sessions'),
    voteLimit: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      voteLimit: args.voteLimit,
    })
  },
})

export const startTimer = mutation({
  args: {
    sessionId: v.id('sessions'),
    duration: v.number(), // milliseconds
    ticketId: v.optional(v.id('tickets')),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      timerState: {
        startedAt: Date.now(),
        duration: args.duration,
        isPaused: false,
      },
      currentDiscussionTicket: args.ticketId,
    })
  },
})

export const pauseTimer = mutation({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session?.timerState) {
      throw new Error('No active timer')
    }

    await ctx.db.patch(args.sessionId, {
      timerState: {
        ...session.timerState,
        isPaused: true,
        pausedAt: Date.now(),
      },
    })
  },
})

export const resumeTimer = mutation({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session?.timerState || !session.timerState.isPaused) {
      throw new Error('Timer is not paused')
    }

    const pausedDuration = Date.now() - (session.timerState.pausedAt ?? 0)

    await ctx.db.patch(args.sessionId, {
      timerState: {
        startedAt: session.timerState.startedAt + pausedDuration,
        duration: session.timerState.duration,
        isPaused: false,
      },
    })
  },
})

export const extendTimer = mutation({
  args: {
    sessionId: v.id('sessions'),
    additionalTime: v.number(), // milliseconds to add
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session?.timerState) {
      throw new Error('No active timer')
    }

    await ctx.db.patch(args.sessionId, {
      timerState: {
        ...session.timerState,
        duration: session.timerState.duration + args.additionalTime,
      },
    })
  },
})

export const completeDiscussion = mutation({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      timerState: undefined,
      currentDiscussionTicket: undefined,
    })
  },
})

export const createActionItem = mutation({
  args: {
    text: v.string(),
    assignee: v.optional(v.string()),
    createdInSprint: v.number(),
    relatedTicketId: v.optional(v.id('tickets')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('actionItems', {
      text: args.text,
      assignee: args.assignee,
      createdInSprint: args.createdInSprint,
      completed: false,
      relatedTicketId: args.relatedTicketId,
    })
  },
})

export const toggleActionItemComplete = mutation({
  args: { actionItemId: v.id('actionItems') },
  handler: async (ctx, args) => {
    const actionItem = await ctx.db.get(args.actionItemId)
    if (!actionItem) {
      throw new Error('Action item not found')
    }

    await ctx.db.patch(args.actionItemId, {
      completed: !actionItem.completed,
      completedAt: !actionItem.completed ? Date.now() : undefined,
    })
  },
})

// ===== PARTICIPANT MANAGEMENT =====

export const updateHeartbeat = mutation({
  args: {
    sessionId: v.id('sessions'),
    participantName: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query('participants')
      .withIndex('sessionAndName', (q) =>
        q.eq('sessionId', args.sessionId).eq('name', args.participantName)
      )
      .first()

    if (!participant) {
      throw new Error('Participant not found')
    }

    await ctx.db.patch(participant._id, {
      lastActiveAt: Date.now(),
    })
  },
})

export const leaveSession = mutation({
  args: {
    sessionId: v.id('sessions'),
    participantName: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query('participants')
      .withIndex('sessionAndName', (q) =>
        q.eq('sessionId', args.sessionId).eq('name', args.participantName)
      )
      .first()

    if (!participant) {
      throw new Error('Participant not found')
    }

    await ctx.db.delete(participant._id)
  },
})

export const removeParticipant = mutation({
  args: {
    participantId: v.id('participants'),
    requestedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db.get(args.participantId)
    if (!participant) {
      throw new Error('Participant not found')
    }

    // Verify requestedBy is the scrum master
    const session = await ctx.db.get(participant.sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    if (session.createdBy !== args.requestedBy) {
      throw new Error('Only the scrum master can remove participants')
    }

    await ctx.db.delete(args.participantId)
  },
})
