import { v4 as uuidv4 } from 'uuid'

function clickControl(control: string) {
    cy.findByRole('button', { name: 'Controls' }).click()
    cy.findByRole('menuitem', { name: control }).click()
}

function addItem(): string {
    const idItem = `Write E2E Tests - ${uuidv4()}`
    cy.findByRole('textbox', { name: 'What do you want to do?' }).type(`${idItem}{enter}`)
    return idItem
}

describe('Todo List', () => {
    before(() => {
        cy.cleanupUser(Cypress.env('email'), Cypress.env('password'))
    })

    beforeEach(() => {
        cy.login(Cypress.env('email'), Cypress.env('password'))
        cy.getCookie('SessionID').then((cookie) => {
            cy.setCookie(cookie.name, cookie.value)
            cy.request({
                method: 'DELETE',
                url: '/api/items',
            })
        })
        cy.visit('/')
    })

    describe('Success', () => {
        it('adds an item to the list', () => {
            const item = addItem()
            cy.findByRole('checkbox', { name: item }).should('exist')
        })

        it('checks an item off the list', () => {
            const item = addItem()
            cy.findByRole('checkbox', { name: item }).click()

            cy.findByRole('checkbox', { name: item }).should('not.exist')
        })

        it('shows completed items', () => {
            const item = addItem()
            cy.findByRole('checkbox', { name: item }).click()
            clickControl('Show Completed Items');

            cy.findByRole('checkbox', { name: item })
                .should('be.checked')
                .should('exist')
        })

        it('deletes completed items', () => {
            const item = addItem()

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
        it('displays an error when failing to add an item', () => {
            cy.intercept({
                url: '/api/items',
                method: 'POST'
            }, { statusCode: 500 })

            cy.visit('/')

            const item = addItem()

            cy.findByRole('checkbox', { name: item }).should('not.exist')
            cy.findByText('Failed to save item. Please try again.').should('exist')
        })

        it('displays an error when failing to load items', () => {
            cy.intercept({
                url: '/api/items',
                method: 'GET'
            }, { statusCode: 500 })

            cy.visit('/')

            cy.findByText('Failed to load items.').should('exist')
        })
    })
})
