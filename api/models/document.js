var mongoose = require( 'mongoose' );
var documentSchema = new mongoose.Schema({
  documentid: String,
  userid: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
  },
  documenthtml: String
});
mongoose.model('Document', documentSchema);
