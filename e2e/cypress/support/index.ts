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
             * @example cy.login('jd@gmail.com', '&jklO99')
             */
            login(email: string, password: string): void

            /**
             * Custom command to clean up and sign up the given user.
             * @example cy.cleanupUser('jd@gmail.com', '&jklO99')
             */
            cleanupUser(email: string, password: string): void

            /**
             * Custom command to delete the given user.
             * @example cy.deleteUser('jd@gmail.com', '&jklO99')
             */
            deleteUser(email: string, password: string): void

            /**
             * Custom command to log a user out via the API.
             * @example cy.logout()
             */
            logout(): void

            /**
             * Custom command to only type in a field if there is text to type.
             * @example cy.typeIfText('')
             */
            typeIfText(label: string | RegExp, value: string): Chainable<JQuery> | undefined
        }
    }
}
