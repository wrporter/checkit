import './commands'

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to sign a user up via the API.
             * @example cy.signup('John Doe', 'jd@gmail.com', '&jklO99')
             */
            signup(name: string, email: string, password: string, withLogout?: boolean): void

            /**
             * Custom command to log a user in via the API.
             * @example cy.signup('jd@gmail.com', '&jklO99')
             */
            login(email: string, password: string): Chainable<Response<void>>

            /**
             * Custom command to delete the given user.
             * @example cy.signup('jd@gmail.com', '&jklO99')
             */
            cleanupUser(email: string, password: string): void

            /**
             * Custom command to log a user out via the API.
             * @example cy.signup('jd@gmail.com', '&jklO99')
             */
            logout(): void

            /**
             * Custom command to delete a user via the API. This is useful for cleaning up after tests that create a
             * user.
             * @example cy.signup('John Doe', 'jd@gmail.com', '&jklO99')
             */
            deleteUser(): void

            /**
             * Custom command to only type in a field if there is text to type.
             * @example cy.typeIfText('')
             */
            typeIfText(label: string | RegExp, value: string): Chainable<JQuery> | undefined
        }
    }
}
