function clickControl(control: string) {
    cy.findByRole('button', { name: 'Controls' }).click()
    cy.findByRole('menuitem', { name: control }).click()
}

function addItem(item: string) {
    cy.findByRole('textbox').type(`${item}{enter}`)
}

describe('Todo List', () => {
    const item = 'Write E2E Tests'

    describe('Success', () => {
        beforeEach(() => {
            cy.cleanupUser(Cypress.env('email'), Cypress.env('password'))
            cy.signup(Cypress.env('name'), Cypress.env('email'), Cypress.env('password'))
            cy.visit('')

            addItem(item)
        })

        it('adds an item to the list', () => {
            cy.findByRole('checkbox', { name: item }).should('exist')
        })

        it('checks an item off the list', () => {
            cy.findByRole('checkbox', { name: item }).click()

            cy.findByRole('checkbox', { name: item }).should('not.exist')
        })

        it('shows completed items', () => {
            cy.findByRole('checkbox', { name: item }).click()
            clickControl('Show Completed Items');

            cy.findByRole('checkbox', { name: item })
                .should('be.checked')
                .should('exist')
        })

        it('deletes completed items', () => {
            cy.findByRole('checkbox', { name: item }).click()
            clickControl('Show Completed Items');
            cy.findByRole('checkbox', { name: item })
                .should('be.checked')
                .should('exist')

            clickControl('Delete Completed Items');

            cy.findByRole('checkbox', { name: item }).should('not.exist')
        })
    })

    describe('Failures', () => {
        beforeEach(() => {
            cy.cleanupUser(Cypress.env('email'), Cypress.env('password'))
            cy.signup(Cypress.env('name'), Cypress.env('email'), Cypress.env('password'))
        })

        it('displays an error when failing to add an item', () => {
            cy.intercept({
                url: '/api/items',
                method: 'POST'
            }, { statusCode: 500 })

            cy.visit('')

            addItem(item)

            cy.findByRole('checkbox', { name: item }).should('not.exist')
            cy.findByText('Failed to save item. Please try again.').should('exist')
        })

        it('displays an error when failing to load items', () => {
            cy.intercept({
                url: '/api/items',
                method: 'GET'
            }, { statusCode: 500 })

            cy.visit('')

            cy.findByText('Failed to load!').should('exist')
        })
    })
})
