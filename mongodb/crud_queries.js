use('expense_analytics');

// CREATE
// db.expenses.insertOne({ user_id:'STU001', amount:250, category:'Food', description:'Lunch', payment_method:'UPI', date:new Date('2026-10-07'), merchant:'Campus Cafe', tags:['food'], created_at:new Date() });

// READ
// db.expenses.find({ category:'Food' }).sort({ date:-1 });
// db.expenses.find({ payment_method:'UPI' });
// db.expenses.find({ $or:[{description:/dinner/i},{merchant:/cafe/i}] });

// UPDATE
// db.expenses.updateOne({ _id:ObjectId('PUT_ID_HERE') }, { $set:{ amount:300, category:'Food' } });

// DELETE
// db.expenses.deleteOne({ _id:ObjectId('PUT_ID_HERE') });
