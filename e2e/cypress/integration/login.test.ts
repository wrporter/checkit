function login(email: string, password: string) {
    cy.visit('/login')

    cy.typeIfText('Email', email)
    cy.typeIfText('Password', password)

    cy.findByRole('button', { name: 'Log in' }).click()
}

describe('Log in', () => {
    before(() => {
        cy.cleanupUser(Cypress.env('email'), Cypress.env('password'))
        cy.signup(Cypress.env('name'), Cypress.env('email'), Cypress.env('password'))
        cy.logout()
    })

    it('requires an email', () => {
        login('', Cypress.env('password'))

        cy.findByText('Please enter an email address').should('exist')
        cy.location('pathname').should('equal', '/login')
    })

    it('requires a password', () => {
        login(Cypress.env('email'), '')

        cy.findByText('Please enter a password').should('exist')
        cy.location('pathname').should('equal', '/login')
    })

    it('fails when a nonexistent email is provided', () => {
        login('checkit-does-not-exist@gmail.com', Cypress.env('password'))

        cy.findByText('Invalid email or password, please try again.').should('exist')
        cy.location('pathname').should('equal', '/login')
    })

    it('fails when the incorrect password is provided', () => {
        login(Cypress.env('email'), 'incorrect-password')

        cy.findByText('Invalid email or password, please try again.').should('exist')
        cy.location('pathname').should('equal', '/login')
    })

    it('logs in successfully', () => {
        login(Cypress.env('email'), Cypress.env('password'))

        cy.findByText('Get stuff done!').should('exist')
    })

    it('allows the user to logout', () => {
        login(Cypress.env('email'), Cypress.env('password'))

        cy.findByRole('button', { name: 'Account menu' }).click()
        cy.findByRole('menuitem', { name: 'Logout' }).click()

        cy.findByText('Get more done with Checkit!').should('exist')
    })
})
