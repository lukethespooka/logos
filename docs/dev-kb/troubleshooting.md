# Troubleshooting Guide

This document is a living repository of common issues, errors, and their solutions encountered during the development of LogOS. Before starting a new task, `@dev` and `@qa` should consult this guide.

## Common Issues

### Supabase Edge Function Timeouts
- **Symptom:** Edge functions return a `504 Gateway Timeout` error.
- **Cause:** The function execution exceeded the 5-second limit on the free plan, often due to a slow external API call or a complex database query.
- **Solution:**
  1. Refactor the function to be more efficient.
  2. Offload long-running tasks to a Supabase background job.
  3. For external API calls, implement a shorter timeout on the client-side and handle the retry logic gracefully.
  4. Ensure all database queries are properly indexed. Use `EXPLAIN ANALYZE` to debug slow queries.

### `pgvector` Indexing Issues
- **Symptom:** Similarity search queries are slow or inefficient.
- **Cause:** The `embedding` column is not properly indexed, or the index type is not optimal for the data.
- **Solution:**
  1. Ensure an IVFFlat or HNSW index is created on the `embedding` column.
  2. For IVFFlat, tune the `lists` parameter. A good starting point is `sqrt(number_of_rows)`.
  3. For HNSW, tune `m` and `ef_construction`.
  4. Periodically re-index the data if it changes frequently.

### Frontend State Desynchronization
- **Symptom:** The UI does not reflect the latest data from the backend.
- **Cause:** TanStack Query cache has become stale and was not invalidated correctly.
- **Solution:**
  1. After any mutation (create, update, delete), use `queryClient.invalidateQueries` to invalidate the relevant queries.
  2. Ensure the query keys are consistent and specific.
  3. For real-time updates, use Supabase Realtime Channels to push changes and update the TanStack Query cache directly. 