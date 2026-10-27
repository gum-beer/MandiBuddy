
Borrow the content from [[CRATE REGISTER]] for seeing how many are there in inventory now in this part we look at how the crates are issued and received 
![[Pasted image 20260903234742.png]]

![[Pasted image 20260903234822.png]]

These are the two refrence images so first in the party/account name we fill in the name of buyer or supplier so fetch this data from consolidated list of buyers and suppliers names. It's not essentially a dropdown but you can search from the list of names already in the database

![[Pasted image 20260903235022.png]]

kinda like this. We select the date of issuing which by default will be the current date but can be changed coz we'd have a calendar input in fronted. 
Then we go to crate type and rather than having a pop up kinda window we have the format like the first image the crate issue heading one and then we choose the crate type from the list already in our db in [[CRATE REGISTER]] we specify the quantity and here is the part we don't necessarily need to tally it from the current stock coz crates are messy and sometimes the number can go in egative which essentialy is fine for data entry but should throw a warning at the end when we save that the data has gone in negative. Rate part here is not required coz price we already specified in the [[CRATE REGISTER]] remarks/notes field optional. and then have an add button as clear as day alongside. ![[Pasted image 20260903235451.png]]

Also slip number is a field which is optional coz in mandi we issue a physical slip which has a number so its good to have it but again in the db the serial number or whatever the pk is for a crate issue entry is seperate from slip number. 

When we do all this we get an option to save. like in the first image so once you save its saved in the crate issue db. After the whole section is finished we will discuss on the db part so hold your horses lets not create all of them this once we wait patiently. Also there is an option to issue crates on cash where we dont know the name of supplier but it is issued on a security and some amount. So have a checkbox in the deets column which says "Cash issue" where we dont have the name in the supplier or customer section or it just says cash we will finalise that and if the prompt is on there is a bool entry in db saying cash yes or no and a amount section appears as we toggle cash which again is still optional but we can add the amount of security there if we want to and it reflects in that particular entry. It is seperte from the financials of sale and arrival as it is just a security amount. 

So remember this as a note/summary the amount when it comes to crate is registerd in the db check [[CRATE REGISTER]] for that however if we issue crate and choose cash then the amount section appears in the issue section and once this all is done and saved we have a "crate recievable section" where we track all the crates that have been issued.

![[Pasted image 20260904001507.png]]

Notice how it says as on date at the top so basically show all the crates issued and then in an order of date from recent to older show the record in the same format. the list can be sorted in the order of qty descending order if we tap on it like in many lists. and at the top we have the filter section where when we type either the customer name or the crate type we only see the data related to them. hope it is clear ask anything before proceeding

