// Sign-up form data and its rules. Fields are image 1 of the spec ("Create Company", minus the
// fiscal-year dates); the rules are image 2's hints. Mock only: nothing is saved (Q6).

export type SignUpValues = {
  companyName: string
  printName: string
  address: string
  address2: string
  city: string
  state: string
  mobile1: string
  mobile2: string
  email: string
  website: string
  contactPerson: string
  marka: string
  username: string
  password: string
  confirmPassword: string
}

export type SignUpErrors = Partial<Record<keyof SignUpValues, string>>

export const emptySignUp: SignUpValues = {
  companyName: '',
  printName: '',
  address: '',
  address2: '',
  city: '',
  state: '',
  mobile1: '',
  mobile2: '',
  email: '',
  website: '',
  contactPerson: '',
  marka: '',
  username: '',
  password: '',
  confirmPassword: '',
}

// Indian mobile: 10 digits, first digit 6–9 (image 2).
const MOBILE = /^[6-9]\d{9}$/
// Letters, numbers and underscores, at least 6 (image 2).
const USERNAME = /^\w{6,}$/

export function validateSignUp(values: SignUpValues): SignUpErrors {
  const errors: SignUpErrors = {}
  const mobile1 = values.mobile1.trim()
  const mobile2 = values.mobile2.trim()

  if (!values.companyName.trim()) errors.companyName = 'Enter the company name'

  if (!mobile1) errors.mobile1 = 'Enter a mobile number'
  else if (!MOBILE.test(mobile1)) errors.mobile1 = '10-digit mobile number starting with 6–9'

  if (mobile2 && !MOBILE.test(mobile2)) errors.mobile2 = '10-digit mobile number starting with 6–9'

  if (!values.username.trim()) errors.username = 'Enter a username'
  else if (!USERNAME.test(values.username.trim()))
    errors.username = 'Letters, numbers and underscores only, at least 6 characters'

  if (!values.password) errors.password = 'Enter a password'
  else if (values.password.length < 6) errors.password = 'At least 6 characters'

  if (!values.confirmPassword) errors.confirmPassword = 'Re-enter the password'
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match'

  return errors
}
