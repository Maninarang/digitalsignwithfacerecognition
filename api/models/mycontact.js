var mongoose = require( 'mongoose' );
var contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  firstName: String,
  lastName: String,
  email: String,
  address: String,
  subject: String,
  message: String,
});
mongoose.model('Contact', contactSchema);
