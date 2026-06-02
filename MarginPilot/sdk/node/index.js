/**
 * @margexa/node — Official Node.js SDK for the Margexa LLM proxy.
 *
 * Wraps the OpenAI client so every call automatically:
 *   1. Routes through the Margexa gateway (cost tracking, policy enforcement)
 *   2. Attaches business-metadata headers (customer, workflow, feature, agent)
 *
 * Usage:
 *   const { MargeXa } = require('@margexa/node');
 *   const mx = new MargeXa({ apiKey: 'mrg_live_...' });
 *
 *   const completion = await mx
 *     .withContext({ customerId: '42', workflow: 'invoice_extraction' })
 *     .chat.completions.create({
 *       model: 'gpt-4o-mini',
 *       messages: [{ role: 'user', content: 'Hello!' }],
 *     });
 */

'use strict';

const { OpenAI } = require('openai');

const DEFAULT_BASE_URL = 'https://api.margexa.io';

class MargeXa {
  /**
   * @param {object} options
   * @param {string} options.apiKey      — Your Margexa API key (starts with mrg_live_)
   * @param {string} [options.baseURL]   — Override gateway URL (default: https://api.margexa.io)
   */
  constructor({ apiKey, baseURL = DEFAULT_BASE_URL } = {}) {
    if (!apiKey) throw new Error('[MargeXa] apiKey is required');

    this._apiKey  = apiKey;
    this._baseURL = baseURL.replace(/\/$/, '');
    this._context = {};

    // Underlying OpenAI client pointed at the Margexa gateway
    this._openai = new OpenAI({
      apiKey,
      baseURL: `${this._baseURL}/v1`,
    });
  }

  /**
   * Attach business metadata for the requests made from this instance.
   * Returns a new MargeXa instance — the original is unchanged.
   *
   * @param {object} ctx
   * @param {string|number} [ctx.customerId]          — X-Customer-Id
   * @param {string|number} [ctx.customerExternalId]  — X-Customer-External-Id
   * @param {string|number} [ctx.planId]              — X-Plan-Id
   * @param {string}        [ctx.plan]                — X-Plan
   * @param {string|number} [ctx.featureId]           — X-Feature-Id
   * @param {string}        [ctx.feature]             — X-Feature
   * @param {string}        [ctx.workflow]            — X-Workflow
   * @param {string}        [ctx.agentId]             — X-Agent-Id (circuit breaker key)
   * @returns {MargeXa}
   */
  withContext(ctx = {}) {
    const child = new MargeXa({ apiKey: this._apiKey, baseURL: this._baseURL });
    child._context = { ...ctx };
    return child;
  }

  /**
   * chat.completions — OpenAI-compatible chat completions through Margexa.
   */
  get chat() {
    const self = this;
    return {
      completions: {
        /**
         * @param {import('openai').ChatCompletionCreateParamsNonStreaming} params
         * @param {import('openai').RequestOptions}                         [options]
         */
        create(params, options = {}) {
          return self._openai.chat.completions.create(params, {
            ...options,
            headers: {
              ...self._buildHeaders(),
              ...(options.headers || {}),
            },
          });
        },
      },
    };
  }

  // ── Private ────────────────────────────────────────────────────────────

  _buildHeaders() {
    const ctx = this._context;
    const h   = {};

    if (ctx.customerId         != null) h['X-Customer-Id']          = String(ctx.customerId);
    if (ctx.customerExternalId != null) h['X-Customer-External-Id'] = String(ctx.customerExternalId);
    if (ctx.planId             != null) h['X-Plan-Id']              = String(ctx.planId);
    if (ctx.plan)                        h['X-Plan']                 = ctx.plan;
    if (ctx.featureId          != null) h['X-Feature-Id']           = String(ctx.featureId);
    if (ctx.feature)                     h['X-Feature']              = ctx.feature;
    if (ctx.workflow)                    h['X-Workflow']             = ctx.workflow;
    if (ctx.agentId)                     h['X-Agent-Id']             = ctx.agentId;

    return h;
  }
}

module.exports = { MargeXa };
