/// <reference types="cypress" />

import { Prisma } from '@prisma/client'

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

Cypress.Commands.add('selectFromComboBox', ({ trigger, searchText }) => {
  // wait for dom to be ready
  cy.wait(1000)
  trigger.click()
  // wait for combo box to be fully ready
  cy.wait(1000)
  cy.get('[cmdk-input]').then(input => {
    // clear input and wait for results to clear before typing and selecting the new option
    if (input.val()) {
      return cy.get('[cmdk-input]').clear().wait(500).type(searchText)
    }
    return cy.get('[cmdk-input]').type(searchText)
  })
  // wait for items to appear
  cy.get('[cmdk-item]')
  // select the first item
  cy.get('[cmdk-group-items]')
    .children()
    .first()
    .click()
    .then(el => {
      // sometimes we need a double click to select the item
      el?.trigger('click')
    })
})

Cypress.Commands.add('queryDb', (query: string) => {
  return cy.task('queryDb', query)
})

Cypress.Commands.add('executeDb', (query: string) => {
  return cy.task('executeDb', query)
})

Cypress.Commands.add('clearDb', () => {
  const tableNames = [
    'address',
    'authentication_nonce',
    'nft_mint',
    'user',
    'user_action',
    'user_action_call',
    'user_action_donation',
    'user_action_email',
    'user_action_email_recipient',
    'user_action_opt_in',
    'user_action_voter_registration',
    'user_crypto_address',
    'user_email_address',
    'user_merge_alert',
    'user_merge_event',
    'user_session',
  ]
  tableNames.forEach(tableName => {
    cy.task('executeDb', `DELETE FROM ${tableName}`)
  })
})

Cypress.Commands.add('seedDb', () => {
  cy.exec('SEED_SIZE=SM')
  cy.exec('npm run ts --transpile-only src/bin/seed/seedLocalDb.ts')
})

export {}

declare global {
  namespace Cypress {
    interface Chainable {
      selectFromComboBox(config: {
        trigger: Chainable<JQuery<Node>>
        searchText: string
      }): Chainable<void>
      queryDb(query: string): Chainable<any>
      executeDb(query: string): Chainable<any>
      clearDb(): Chainable<void>
      seedDb(): Chainable<void>

      //   drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //   dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //   visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}
