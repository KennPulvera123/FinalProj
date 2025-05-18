import mongoose from "mongoose";
const { Schema } = mongoose;

const bookingSchema = new Schema({
  place: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Place" },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  checkIn: Date,
  checkOut: Date,
  numberOfGuests: Number,
  name: String,
  phone: String,
  price: Number,
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
