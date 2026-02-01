# Labels

The transaction table has a "Labels" column on the right
Each transaction has a "+ label" button in this column which appears as plain grey text
Clicking the "+ label" opens a modal which has the features described below. This should be a new spinder-label-transaction-management component which uses the modal component.
When a transaction has one single label, the label is shown with the "+ label" button next to it
When a transaction has two or more labels, the first label is shown with "+X more" next to it showing how many more labels are on this transaction but not displayed. This "+2 more" is a button that opens the modal.
Labels can be up to 10 characters in length.
Clicking on a label adds a filter to the transaction table so that only transactions with that label are shown. The filter should say Filtering "Example" label and should otherwise behave like the buckets.
A label filter and a bucket filter can be applied at the same time, but only one of each.
The "spinder-time" component should be renamed to "spinder-filters" which contains the current time behavior but also contains a dropdown of labels where the user can select a label to add as a filter. This should be added as a flex row next to the time filter dropdown. The existing x button should clear both the time filter and the label filter.

# Modal Component

Labels already on the transaction are shown on the right and can be removed with an x button.
When a button is removed from the transaction it is added to the dropdown so that it can be added back if desired.
Existing labels that are not added to this transaction can be added to it from a custom dropdown.
The dropdown only contains labels that are not already on this dropdown.
Choosing a label from the dropdown adds it to the staging area on the right and removes it from the dropdown.
New labels can be created with a plain text field, limited to 10 characters. A button below the text field says "Create and Add" which adds it to the list on the right.
All of these changes are "staged" in local component state. When the modal is submitted, then any labels that need created are created and added to the transaction, any existing labels that need added to the transaction are added, and any labels that need removed from the transaction are removed.
