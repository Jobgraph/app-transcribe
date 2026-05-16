import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

vi.mock('./config', () => ({
  loadConfig: vi.fn(),
}))

import { loadConfig } from './config'
const mockLoadConfig = vi.mocked(loadConfig)

describe('App (transcribe)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows not-configured message when isConfigured is false', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Transcribe', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: false,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('This app is not configured. Deploy it from Jobgraph to get started.')).toBeInTheDocument()
    })
  })

  it('renders textarea and disabled button when configured', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Transcribe', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Paste your meeting transcript here...')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Process transcript' })).toBeDisabled()
  })

  it('enables button when textarea has content', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Transcribe', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Paste your meeting transcript here...')).toBeInTheDocument()
    })
    fireEvent.change(screen.getByPlaceholderText('Paste your meeting transcript here...'), { target: { value: 'Meeting notes...' } })
    expect(screen.getByRole('button', { name: 'Process transcript' })).not.toBeDisabled()
  })

  it('shows results after successful API call', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Transcribe', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        structured: {
          summary: 'Test summary',
          decisions: ['Decision 1'],
          actions: [{ what: 'Task 1', who: 'Alice', by: '2024-01-01' }],
          followUpEmail: 'Hi team',
        },
      }),
    }) as any

    render(<App />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Paste your meeting transcript here...')).toBeInTheDocument()
    })
    fireEvent.change(screen.getByPlaceholderText('Paste your meeting transcript here...'), { target: { value: 'Meeting notes' } })
    fireEvent.click(screen.getByRole('button', { name: 'Process transcript' }))

    await waitFor(() => {
      expect(screen.getByText('Test summary')).toBeInTheDocument()
    })
    expect(screen.getByText('Decision 1')).toBeInTheDocument()
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })
})
