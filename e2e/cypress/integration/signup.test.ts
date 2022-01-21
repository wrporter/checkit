import { v4 as uuidv4 } from 'uuid'

function signup(name: string, email: string, password: string) {
    cy.intercept('/api/auth/user').as('getUser')

    cy.visit('/signup')
    cy.wait('@getUser')

    cy.typeIfText('Display Name', name)
    cy.typeIfText('Email', email)
    cy.typeIfText('Password', password)

    cy.findByRole('button', { name: 'Sign up' }).click()
}

describe('Sign up', () => {
    describe('Validation', () => {
        it('requires a name to sign up', () => {
            signup('', Cypress.env('email'), Cypress.env('password'))

            cy.findByText('Please enter a display name').should('exist')
            cy.location('pathname').should('equal', '/signup')
        })

        it('requires an email to sign up', () => {
            signup(Cypress.env('name'), '', Cypress.env('password'))

            cy.findByText('Please enter an email address').should('exist')
            cy.location('pathname').should('equal', '/signup')
        })

        it('requires a password to sign up', () => {
            signup(Cypress.env('name'), Cypress.env('email'), '')

            cy.findByText('Please enter a password').should('exist')
            cy.location('pathname').should('equal', '/signup')
        })
    })

    describe('Success', () => {
        beforeEach(() => {
            cy.session(uuidv4(), () => {
                cy.cleanupUser(Cypress.env('email'), Cypress.env('password'))
                cy.signup(Cypress.env('name'), Cypress.env('email'), Cypress.env('password'))
                cy.logout()
            })
        })

        it('logs the user in upon sign up', () => {
            const email = 'checkit-test+signup@gmail.com';
            const password = 'fakepass';
            signup('Test User', email, password)
            cy.wait('@getUser')

            cy.findByText('Get stuff done!').should('exist')
            cy.cleanupUser(email, password)
        })

        it('does not allow the user to sign up when the account already exists', () => {
            signup(Cypress.env('name'), Cypress.env('email'), Cypress.env('password'))

            cy.findByText('Failed to sign up, please try again.').should('exist')
        })
    })
})
