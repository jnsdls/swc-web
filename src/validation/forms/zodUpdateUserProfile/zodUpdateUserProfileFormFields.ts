import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodOptionalEmptyString } from '@/validation/utils'

import { zodUpdateUserProfileBase, zodUpdateUserProfileBaseSuperRefine } from './base'

export const zodUpdateUserProfileFormFields = zodUpdateUserProfileBase
  .extend({
    firstName: zodOptionalEmptyString(zodFirstName),
    lastName: zodOptionalEmptyString(zodLastName),
    address: zodGooglePlacesAutocompletePrediction.nullable(),
  })
  .superRefine(zodUpdateUserProfileBaseSuperRefine)
// previously there was a requirement that we don't allow users to become members if
// they dont fill out their first/last name, but this causes issues because we stop showing the checkbox
// but a user can still modify their profile and remove their first/last name, causing the form to break (wont submit but no errors are displayed)
