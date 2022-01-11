import '@testing-library/cypress/add-commands'
import Chainable = Cypress.Chainable;
import Response = Cypress.Response;

Cypress.Commands.add('signup', (name: string, email: string, password: string) => {
    cy.request({
        method: 'POST',
        url: '/api/auth/signup',
        body: {
            displayName: name,
            email,
            password,
        },
        failOnStatusCode: false,
    })
})

Cypress.Commands.add('logout', () => {
    cy.clearCookies()
})

Cypress.Commands.add('login', (email: string, password: string): Chainable<Response<void>> => {
    return cy.request({
        url: '/api/auth/login',
        method: 'POST',
        body: {
            email,
            password,
        }
    })
})

Cypress.Commands.add('cleanupUser', (email: string, password: string) => {
    cy.request({
        url: '/api/auth/login',
        method: 'POST',
        body: {
            email,
            password,
        },
        failOnStatusCode: false,
    })

    cy.request({
        url: '/api/auth/user',
        method: 'DELETE',
        failOnStatusCode: false,
    })
})

Cypress.Commands.add('deleteUser', () => {
    cy.getCookie('SessionID').then((sessionCookie) => {
        if (sessionCookie) {
            cy.request({
                method: 'DELETE',
                url: '/api/auth/user'
            })
        }
        cy.clearCookie('SessionID')
    })
})

Cypress.Commands.add('typeIfText', (label: string | RegExp, value: string): Chainable<JQuery> | undefined => {
    if (value) {
        return cy.findByLabelText(label).type(value)
    }
})
