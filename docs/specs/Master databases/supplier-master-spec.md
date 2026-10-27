# Farmer / Supplier Master Table — Feature Spec

*Masters*

> ★ = mandatory field

## Fields

| Field                    | Mandatory | Details                                                                                                                                                                                                                             |
| ------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name of the Supplier** | ★         | —                                                                                                                                                                                                                                   |
| **Code**                 | ★         | Can be auto-generated as a unique ID; may serve as the Primary Key.                                                                                                                                                                 |
| **Name in Hindi**        |           | Auto-translates the Name field from English to Hindi. If the name is already in Hindi, no change is made. If the language in the Name field is neither Hindi nor English, copy whatever is in the Name field as-is into this field. |
| **Select Photo**         |           | Upload a photo. Optional.                                                                                                                                                                                                           |
| **Address Line**         | ★         | Complete address of the party.                                                                                                                                                                                                      |
| **Address Line 2**       |           | Extended address (continuation of Address Line).                                                                                                                                                                                    |
| **City**                 | ★         | Self-explanatory.                                                                                                                                                                                                                   |
| **State**                |           | Self-explanatory.                                                                                                                                                                                                                   |
| **Mobile 1**             | ★         | — only numeric input                                                                                                                                                                                                                |
| **Guarantor**            | ★         | Add the name of a guarantor, if any. Includes a **Guarantor Phone Number** sub-field.                                                                                                                                               |

Since this is the first page you will be doing so before that lets have a vanilla sign up and sign in page the auth part will be done later have a user and password like abc abc to start with and make this database and the frontend part and i want deets of what was done to the code


![[Pasted image 20260901041041.png]]

openeing balance metric example design

