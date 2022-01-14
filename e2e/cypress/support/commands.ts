import '@testing-library/cypress/add-commands'
import Chainable = Cypress.Chainable;

Cypress.Commands.add('signup', (name: string, email: string, password: string) => {
    cy.visit('/signup')
    cy.intercept('/api/auth/user').as('getUser')

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

    cy.getCookie('SessionID')
        .then((cookie) => {
            if (cookie) {
                cy.setCookie(cookie.name, cookie.value)
            }
        })

    cy.visit('/')
    cy.wait('@getUser')
})

Cypress.Commands.add('logout', () => {
    cy.clearCookies()
})

Cypress.Commands.add('login', (email: string, password: string): void => {
    cy.session([email, password], () => {
        cy.visit('/login')
        cy.intercept('/api/auth/user').as('getUser')

        cy.request({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email,
                password,
            },
        })

        cy.visit('/')
        cy.wait('@getUser')
    })
})

Cypress.Commands.add('cleanupUser', (email: string, password: string): void => {
    cy.visit('/login')

    cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
            email,
            password,
        },
        failOnStatusCode: false,
    })

    cy.getCookie('SessionID')
        .then((cookie) => {
            if (cookie) {
                cy.setCookie(cookie.name, cookie.value)

                cy.request({
                    method: 'DELETE',
                    url: '/api/auth/user',
                    failOnStatusCode: false,
                })
            }
        })
})

Cypress.Commands.add('typeIfText', (label: string | RegExp, value: string): Chainable<JQuery> | undefined => {
    if (value) {
        return cy.findByLabelText(label).type(value)
    }
})
