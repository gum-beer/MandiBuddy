# Arrival Entry — Feature Spec

*Starts the day*

## Arrival Entry

| Field              | Details                                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Date**           | Calendar format                                                                                                                                                                                                                                              |
| **Arrival Type**   | Dropdown — options: *Party Stock* or *Self Purchase*                                                                                                                                                                                                         |
| **Vehicle Number** | —                                                                                                                                                                                                                                                            |
| **Supplier Name**  | Dropdown, populated from supplier details stored in the Master Data section. Should also include an "Add New" option that opens a pop-up window to add a new supplier directly to the Supplier Master Data section. *(Details on this to be covered later.)* |

## Item Table

This table holds all the stock received in that entry. It lives on the Arrival Entry page itself, and multiple items can be added to it.

- A column to add items, with the item name auto-filled from the Items table in Master Data.

### Table Columns / Parameters

**Lot No. / Variety**
Every item has a unique lot number, which can be alphanumeric. If it isn't unique within that day's entry, append `-1`, `-2`, etc. (similar to how Windows handles duplicate filenames).

> **Uniqueness rule:** "Unique" means unique within that day's arrival entry *for that specific supplier*. For example, on June 10th for supplier "John," there can only be one lot no. "100." However, lot no. "100" could also be used on June 11th for any supplier, or on June 10th for a different supplier ("Max"). In other words, uniqueness is scoped to the combination of **date + supplier name**.

**Nug** (quantity/count)
Indicates the number of units (nugs) or inventory for that lot no.
- Includes a checkbox labeled **"Crate Form."** If selected, it should pull from the Crate table in Master Data and show a dropdown to select the crate type.

**Weight**
Optional; numeric only.

## Other Charges

Also part of the Arrival Entry page, as its own section.

- A dropdown with multiple selectable options for charge types. This list is **static** — not fetched from any other table.
- For now, the charge types are:
  - Freight
  - Labour

## Page Actions

The page needs a few buttons at the top:
- **Save**
- **Delete**
- **Close**
- **Print**

**Print** exports the entry data into a PDF with a static layout *(to be discussed further)*.

![[Pasted image 20260901035731.png]]

so as you can see when the arrival entry says self purchase using a dropdown in arrival type it means that you directly bought the stock so there is a column for amount and rate as well in the arrival itself as it is a direct cost.
## Arrival Book

Every arrival entry will appear in an [[Arrival book]] section, which contains all entries in the above format.


![[Pasted image 20260901041246.png]]

arrival design example and fields 


![[Pasted image 20260901041530.png]]

avoid this add button ui is modern but structure is tabular only