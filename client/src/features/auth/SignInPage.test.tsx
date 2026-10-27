import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import SignInPage from './SignInPage.tsx'

function renderSignIn() {
  const onSignIn = vi.fn()
  render(
    <MemoryRouter initialEntries={['/signin']}>
      <Routes>
        <Route path="/signin" element={<SignInPage onSignIn={onSignIn} />} />
        <Route path="/app" element={<p>app page</p>} />
      </Routes>
    </MemoryRouter>,
  )
  return { onSignIn, user: userEvent.setup() }
}

describe('SignInPage (mock)', () => {
  it('marks both fields and focuses the first when submitted empty', async () => {
    const { user, onSignIn } = renderSignIn()
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByLabelText('Email / Username')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Email / Username')).toHaveFocus()
    expect(onSignIn).not.toHaveBeenCalled()
  })

  it('rejects a wrong password', async () => {
    const { user, onSignIn } = renderSignIn()
    await user.type(screen.getByLabelText('Email / Username'), 'abc')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Wrong username or password')
    expect(onSignIn).not.toHaveBeenCalled()
  })

  it('signs in abc / abc and goes to the app', async () => {
    const { user, onSignIn } = renderSignIn()
    await user.type(screen.getByLabelText('Email / Username'), 'abc')
    await user.type(screen.getByLabelText('Password'), 'abc')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(onSignIn).toHaveBeenCalledWith('abc')
    expect(screen.getByText('app page')).toBeInTheDocument()
  })

  it('shows and hides the password', async () => {
    const { user } = renderSignIn()
    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Show' }))
    expect(password).toHaveAttribute('type', 'text')
  })
})
