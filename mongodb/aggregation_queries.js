use('expense_analytics');

// 1. Total spending + average + transaction count
// db.expenses.aggregate([{ $group:{ _id:null, total:{ $sum:'$amount' }, average:{ $avg:'$amount' }, count:{ $sum:1 } } }]);

// 2. Category-wise spending
// db.expenses.aggregate([{ $group:{ _id:'$category', total:{ $sum:'$amount' } } }, { $sort:{ total:-1 } }]);

// 3. Monthly spending
// db.expenses.aggregate([{ $group:{ _id:{ $dateToString:{ format:'%Y-%m', date:'$date' } }, total:{ $sum:'$amount' } } }, { $sort:{ _id:1 } }]);

// 4. Payment-method analysis
// db.expenses.aggregate([{ $group:{ _id:'$payment_method', total:{ $sum:'$amount' } } }, { $sort:{ total:-1 } }]);

// 5. Highest spending category
// db.expenses.aggregate([{ $group:{ _id:'$category', total:{ $sum:'$amount' } } }, { $sort:{ total:-1 } }, { $limit:1 }]);

// 6. Top merchants
// db.expenses.aggregate([{ $match:{ merchant:{ $nin:[null,''] } } }, { $group:{ _id:'$merchant', total:{ $sum:'$amount' }, transactions:{ $sum:1 } } }, { $sort:{ total:-1 } }, { $limit:5 }]);

// 7. Daily spending trend
// db.expenses.aggregate([{ $group:{ _id:{ $dateToString:{ format:'%Y-%m-%d', date:'$date' } }, total:{ $sum:'$amount' } } }, { $sort:{ _id:1 } }]);
