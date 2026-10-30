from datetime import datetime
from database import expenses

expenses.delete_many({})
records = [
{"user_id":"STU001","amount":320,"category":"Food","description":"Lunch","payment_method":"UPI","date":datetime(2026,7,2),"merchant":"Campus Cafe","tags":["food","college"]},
{"user_id":"STU001","amount":180,"category":"Transport","description":"Auto to college","payment_method":"Cash","date":datetime(2026,7,3),"merchant":"City Auto","tags":["travel"]},
{"user_id":"STU001","amount":850,"category":"Education","description":"Programming book","payment_method":"Credit Card","date":datetime(2026,7,5),"merchant":"BookWorld","tags":["study"]},
{"user_id":"STU001","amount":499,"category":"Entertainment","description":"Streaming subscription","payment_method":"UPI","date":datetime(2026,7,7),"merchant":"StreamFlix","tags":["subscription"]},
{"user_id":"STU001","amount":1200,"category":"Bills","description":"Mobile and internet","payment_method":"UPI","date":datetime(2026,7,10),"merchant":"Jio","tags":["bills"]},
{"user_id":"STU001","amount":760,"category":"Shopping","description":"Clothes","payment_method":"Debit Card","date":datetime(2026,7,12),"merchant":"StyleHub","tags":["clothes"]},
{"user_id":"STU001","amount":260,"category":"Food","description":"Dinner","payment_method":"UPI","date":datetime(2026,7,15),"merchant":"FoodExpress","tags":["food"]},
{"user_id":"STU001","amount":150,"category":"Transport","description":"Metro recharge","payment_method":"UPI","date":datetime(2026,7,18),"merchant":"Metro","tags":["travel"]},
{"user_id":"STU001","amount":430,"category":"Healthcare","description":"Medicines","payment_method":"Cash","date":datetime(2026,7,20),"merchant":"WellCare Pharmacy","tags":["health"]},
{"user_id":"STU001","amount":300,"category":"Food","description":"Groceries","payment_method":"Debit Card","date":datetime(2026,7,23),"merchant":"FreshMart","tags":["food"]},
{"user_id":"STU001","amount":620,"category":"Shopping","description":"Backpack","payment_method":"UPI","date":datetime(2026,7,26),"merchant":"StyleHub","tags":["college"]},
{"user_id":"STU001","amount":220,"category":"Entertainment","description":"Movie","payment_method":"Credit Card","date":datetime(2026,7,28),"merchant":"CineMax","tags":["movie"]},
{"user_id":"STU001","amount":280,"category":"Food","description":"Lunch","payment_method":"UPI","date":datetime(2026,8,1),"merchant":"Campus Cafe","tags":["food"]},
{"user_id":"STU001","amount":200,"category":"Transport","description":"Cab","payment_method":"UPI","date":datetime(2026,8,3),"merchant":"QuickCab","tags":["travel"]},
{"user_id":"STU001","amount":900,"category":"Education","description":"Online course","payment_method":"Debit Card","date":datetime(2026,8,5),"merchant":"LearnPro","tags":["study"]},
{"user_id":"STU001","amount":1350,"category":"Bills","description":"Electricity","payment_method":"UPI","date":datetime(2026,8,8),"merchant":"PowerGrid","tags":["bills"]},
{"user_id":"STU001","amount":540,"category":"Food","description":"Dinner","payment_method":"UPI","date":datetime(2026,8,10),"merchant":"FoodExpress","tags":["food"]},
{"user_id":"STU001","amount":1100,"category":"Shopping","description":"Shoes","payment_method":"Credit Card","date":datetime(2026,8,12),"merchant":"StyleHub","tags":["shopping"]},
{"user_id":"STU001","amount":250,"category":"Transport","description":"Fuel","payment_method":"Cash","date":datetime(2026,8,15),"merchant":"HP Fuel","tags":["travel"]},
{"user_id":"STU001","amount":350,"category":"Food","description":"Groceries","payment_method":"Debit Card","date":datetime(2026,8,18),"merchant":"FreshMart","tags":["food"]},
{"user_id":"STU001","amount":480,"category":"Entertainment","description":"Concert ticket","payment_method":"UPI","date":datetime(2026,8,20),"merchant":"BookMyShow","tags":["entertainment"]},
{"user_id":"STU001","amount":500,"category":"Healthcare","description":"Dental checkup","payment_method":"Cash","date":datetime(2026,8,23),"merchant":"WellCare Clinic","tags":["health"]},
{"user_id":"STU001","amount":300,"category":"Food","description":"Dinner","payment_method":"UPI","date":datetime(2026,8,25),"merchant":"Campus Cafe","tags":["food"]},
{"user_id":"STU001","amount":190,"category":"Transport","description":"Auto","payment_method":"Cash","date":datetime(2026,8,27),"merchant":"City Auto","tags":["travel"]},
{"user_id":"STU001","amount":700,"category":"Education","description":"Exam material","payment_method":"UPI","date":datetime(2026,8,29),"merchant":"BookWorld","tags":["study"]},
{"user_id":"STU001","amount":300,"category":"Other","description":"Miscellaneous","payment_method":"Cash","date":datetime(2026,8,31),"merchant":"Local Store","tags":["misc"]},
{"user_id":"STU001","amount":360,"category":"Food","description":"Lunch","payment_method":"UPI","date":datetime(2026,9,2),"merchant":"FoodExpress","tags":["food"]},
{"user_id":"STU001","amount":220,"category":"Transport","description":"Cab","payment_method":"UPI","date":datetime(2026,9,4),"merchant":"QuickCab","tags":["travel"]},
{"user_id":"STU001","amount":650,"category":"Shopping","description":"Headphones","payment_method":"Debit Card","date":datetime(2026,9,6),"merchant":"TechMart","tags":["electronics"]},
{"user_id":"STU001","amount":499,"category":"Entertainment","description":"Streaming subscription","payment_method":"UPI","date":datetime(2026,9,8),"merchant":"StreamFlix","tags":["subscription"]},
{"user_id":"STU001","amount":1450,"category":"Bills","description":"Rent contribution","payment_method":"UPI","date":datetime(2026,9,10),"merchant":"HomePay","tags":["rent"]},
{"user_id":"STU001","amount":280,"category":"Food","description":"Dinner","payment_method":"UPI","date":datetime(2026,9,12),"merchant":"Campus Cafe","tags":["food"]},
{"user_id":"STU001","amount":420,"category":"Healthcare","description":"Pharmacy","payment_method":"Cash","date":datetime(2026,9,14),"merchant":"WellCare Pharmacy","tags":["health"]},
{"user_id":"STU001","amount":800,"category":"Education","description":"Course certificate","payment_method":"Credit Card","date":datetime(2026,9,16),"merchant":"LearnPro","tags":["study"]},
{"user_id":"STU001","amount":580,"category":"Shopping","description":"Jeans","payment_method":"UPI","date":datetime(2026,9,19),"merchant":"StyleHub","tags":["clothes"]},
{"user_id":"STU001","amount":240,"category":"Transport","description":"Metro","payment_method":"UPI","date":datetime(2026,9,21),"merchant":"Metro","tags":["travel"]},
{"user_id":"STU001","amount":310,"category":"Food","description":"Groceries","payment_method":"Debit Card","date":datetime(2026,9,23),"merchant":"FreshMart","tags":["food"]},
{"user_id":"STU001","amount":260,"category":"Entertainment","description":"Movie","payment_method":"UPI","date":datetime(2026,9,25),"merchant":"CineMax","tags":["movie"]},
{"user_id":"STU001","amount":1000,"category":"Bills","description":"Phone and internet","payment_method":"UPI","date":datetime(2026,9,27),"merchant":"Jio","tags":["bills"]},
{"user_id":"STU001","amount":330,"category":"Food","description":"Dinner","payment_method":"Cash","date":datetime(2026,9,29),"merchant":"FoodExpress","tags":["food"]},
{"user_id":"STU001","amount":180,"category":"Other","description":"Stationery","payment_method":"Cash","date":datetime(2026,9,30),"merchant":"Local Store","tags":["college"]}
]
for r in records:
    r["created_at"] = datetime.utcnow()
expenses.insert_many(records)
print(f"Inserted {len(records)} sample expenses into {expenses.full_name}")
