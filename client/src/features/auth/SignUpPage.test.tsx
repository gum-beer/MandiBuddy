import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import SignUpPage from './SignUpPage.tsx'
import { emptySignUp, validateSignUp } from './signUp.ts'

const valid = {
  ...emptySignUp,
  companyName: 'Test Company',
  mobile1: '9876543210',
  username: 'test_user',
  password: 'secret1',
  confirmPassword: 'secret1',
}

describe('validateSignUp', () => {
  it('passes a form with only the required fields filled', () => {
    expect(validateSignUp(valid)).toEqual({})
  })

  it('requires company name, mobile 1, username, password and confirm', () => {
    expect(Object.keys(validateSignUp(emptySignUp)).sort()).toEqual(
      ['companyName', 'confirmPassword', 'mobile1', 'password', 'username'].sort(),
    )
  })

  it('treats a company name of only spaces as empty', () => {
    expect(validateSignUp({ ...valid, companyName: '   ' })).toHaveProperty('companyName')
  })

  it('accepts a 10-digit mobile starting 6–9 and rejects others', () => {
    expect(validateSignUp({ ...valid, mobile1: '6000000000' })).toEqual({})
    expect(validateSignUp({ ...valid, mobile1: '5123456789' })).toHaveProperty('mobile1')
    expect(validateSignUp({ ...valid, mobile1: '987654321' })).toHaveProperty('mobile1')
    expect(validateSignUp({ ...valid, mobile1: '98765abcde' })).toHaveProperty('mobile1')
  })

  it('checks mobile 2 only when it is filled', () => {
    expect(validateSignUp({ ...valid, mobile2: '' })).toEqual({})
    expect(validateSignUp({ ...valid, mobile2: '12345' })).toHaveProperty('mobile2')
  })

  it('username: letters, numbers, underscores, at least 6', () => {
    expect(validateSignUp({ ...valid, username: 'abc_12' })).toEqual({})
    expect(validateSignUp({ ...valid, username: 'abc12' })).toHaveProperty('username')
    expect(validateSignUp({ ...valid, username: 'abc-123' })).toHaveProperty('username')
  })

  it('password at least 6, and confirm must match', () => {
    expect(validateSignUp({ ...valid, password: '12345', confirmPassword: '12345' })).toHaveProperty(
      'password',
    )
    expect(validateSignUp({ ...valid, confirmPassword: 'secret2' })).toHaveProperty('confirmPassword')
  })
})

describe('SignUpPage (mock)', () => {
  function renderSignUp() {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <SignUpPage />
      </MemoryRouter>,
    )
    return userEvent.setup()
  }

  it('on an empty submit, marks required fields red and focuses Name of company', async () => {
    const user = renderSignUp()
    await user.click(screen.getByRole('button', { name: 'Create company' }))

    const company = screen.getByLabelText(/name of company/i)
    expect(company).toHaveFocus()
    expect(company).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/mobile 1/i)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/^print name/i)).not.toHaveAttribute('aria-invalid')
  })

  it('a valid form shows the mock notice and saves nothing', async () => {
    const user = renderSignUp()
    await user.type(screen.getByLabelText(/name of company/i), 'Test Company')
    await user.type(screen.getByLabelText(/mobile 1/i), '9876543210')
    await user.type(screen.getByLabelText(/^username/i), 'test_user')
    await user.type(screen.getByLabelText(/^password/i), 'secret1')
    await user.type(screen.getByLabelText(/confirm password/i), 'secret1')
    await user.click(screen.getByRole('button', { name: 'Create company' }))

    expect(screen.getByRole('status')).toHaveTextContent('nothing was saved')
    expect(screen.getByRole('link', { name: /go to sign in/i })).toHaveAttribute('href', '/signin')
  })
})
