![[Pasted image 20260825185524.png]]

Fetches data from the given dates arrival book and as you type supplier name all the stock of the given arrival date and supplier name is loaded for you to sale 

By that i mean that say for 10th January i have three entries in arrival book for John Max and Smith so when i choose 10th january and John in stock sale you have to bring out the arrival data for the same. and once i change the supplier the data changes so basically when i select a particular date the supplier name dropdown asks me to choose between all the suppliers that exist in that dates arrival entry. there should be a fixed date not a range in stock sale. and then when you enter the item name it should show the items that were registered under the chosen suppliers' arrival entry.

Now coming to customer name so customer name again is a part of [[master_customer_name]] data where we store the details of registered customers. it should also have an inbuilt option i the dropdown named cash by default. 

Again Lot number comes from the supplier name stored on that particular date in arrival entry. 

This becomes intuitive if you realize stock is sold from arrival entry for that day

**Also all the dropdowns should be able to exercise search feature as well**. like a searchable dropdown

then we come to the part where the details of that dates sail is registered and we add items to each row-:
- NUG contians the number of nugs sold to the selected particular customer from the selected particular lot and once you select the total number of nugs you **subtract** the nugs from that lot's nugs list in the arrival list so essetialy the stock that arrived has been sold
- Then we have a switch kind of trigger that we choose for that particular lot to determine wether it was sold by weight or by container. its like a toggle switch where one entry is weight and one is container
- Then we have 2 seperate entries for customer rate and supplier rate. Its imortant to note that when we go to the [[supplier bill]] section then the price is what's written in the supplier rate section and when we go to the customer payment section the price written in customer rate section is what is being charged to the customer + the commision
- Very important point there should be a commision button on the panel which once clicked should open a pop up like in the image below and should have all these values as shown in the green box .It should have an editable section of values like below however when i want to tweak them i should have that flexibility to do so for example when i set it to certain values it should remain the same throughut even when i open the stock sale on a different date for a completely seperate day however i should have the flexibility to edit the values. This section is critical so if you understood that give me a note with examples of how you have set the values in this section and ill advice you for yes or no or anything else ![[Pasted image 20260825215539.png]]

- Aight so once the ADD button is pressed it makes an entry to that days stock sale and sets the whole row in this format ad should have the save , clear delete button and once added it should make an entry of the whole thing in a sale report where a table like structure should be arranged and read all the sales added and contain a date range.
  ![[Pasted image 20260825220751.png]]
  
  
  

![[Pasted image 20260901040254.png]]

we need the sale page to have this level of deets and variables but not the old design design ours logic old with new tweaks

and the crate marka here is a placeholder none of the values in any image are real



ALSO THE ARRIVAL AND SALE LOGS should have a warning and ask the password before trying to delete for added security
