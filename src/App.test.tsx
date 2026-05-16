import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

vi.mock('./config', () => ({
  loadConfig: vi.fn(),
}))

import { loadConfig } from './config'
const mockLoadConfig = vi.mocked(loadConfig)

const CONFIGURED = {
  deploymentId: 'test-id', appName: 'Transcribe', orgName: 'Test', brandColour: '#6366f1',
  logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
}

describe('App (transcribe)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows not-configured message when isConfigured is false', async () => {
    mockLoadConfig.mockResolvedValue({
      ...CONFIGURED, isConfigured: false,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('This app is not configured. Deploy it from Jobgraph to get started.')).toBeInTheDocument()
    })
  })

  it('renders mode tabs defaulting to Record', async () => {
    mockLoadConfig.mockResolvedValue(CONFIGURED)
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Record')).toBeInTheDocument()
      expect(screen.getByText('Upload')).toBeInTheDocument()
      expect(screen.getByText('Paste')).toBeInTheDocument()
    })
    // Record mode shows "Tap to start recording"
    expect(screen.getByText('Tap to start recording')).toBeInTheDocument()
  })

  it('renders textarea and disabled button in paste mode', async () => {
    mockLoadConfig.mockResolvedValue(CONFIGURED)
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Paste')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Paste'))
    expect(screen.getByPlaceholderText('Paste your meeting transcript here...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Process transcript' })).toBeDisabled()
  })

  it('enables button when textarea has content', async () => {
    mockLoadConfig.mockResolvedValue(CONFIGURED)
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Paste')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste your meeting transcript here...'), { target: { value: 'Meeting notes...' } })
    expect(screen.getByRole('button', { name: 'Process transcript' })).not.toBeDisabled()
  })

  it('shows results after successful API call', async () => {
    mockLoadConfig.mockResolvedValue(CONFIGURED)
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
      expect(screen.getByText('Paste')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste your meeting transcript here...'), { target: { value: 'Meeting notes' } })
    fireEvent.click(screen.getByRole('button', { name: 'Process transcript' }))

    await waitFor(() => {
      expect(screen.getByText('Test summary')).toBeInTheDocument()
    })
    expect(screen.getByText('Decision 1')).toBeInTheDocument()
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })

  it('shows Transcribe button in record mode', async () => {
    mockLoadConfig.mockResolvedValue(CONFIGURED)
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Tap to start recording')).toBeInTheDocument()
    })
    // The submit button says "Transcribe" in audio modes
    expect(screen.getByRole('button', { name: 'Transcribe' })).toBeDisabled()
  })
})
