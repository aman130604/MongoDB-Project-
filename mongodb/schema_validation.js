use('expense_analytics');
db.createCollection('expenses', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id','amount','category','description','payment_method','date'],
      properties: {
        user_id: { bsonType: 'string', minLength: 1 },
        amount: { bsonType: ['double','int','long','decimal'], minimum: 0.01 },
        category: { enum: ['Food','Transport','Shopping','Bills','Education','Entertainment','Healthcare','Other'] },
        description: { bsonType: 'string', minLength: 1 },
        payment_method: { enum: ['Cash','UPI','Credit Card','Debit Card'] },
        date: { bsonType: 'date' },
        merchant: { bsonType: 'string' },
        tags: { bsonType: 'array', items: { bsonType: 'string' } },
        created_at: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});
