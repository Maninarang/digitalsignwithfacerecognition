var mongoose = require( 'mongoose' );
var documentSchema = new mongoose.Schema({
  documentid: String,
  userid: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     priority : Number,
     signed: Boolean
  }],
  documenthtml: String,
  withimage: Boolean
});
mongoose.model('Document', documentSchema);
